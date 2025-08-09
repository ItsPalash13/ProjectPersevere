import os
import time
import logging
from datetime import datetime
from typing import List, Dict, Any

from bson import ObjectId
from pymongo import MongoClient, ReturnDocument
from dotenv import load_dotenv


def load_config():
    load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))
    mongo_uri = os.getenv('MONGO_URI')
    attempt_window_size = int(os.getenv('ATTEMPT_WINDOW_SIZE', '10'))
    accuracy_weight = float(os.getenv('ACCURACY_WEIGHT', '1.2'))
    if not mongo_uri:
        raise RuntimeError('MONGO_URI missing in Services/.env')
    logging.info(f"Config loaded: ATTEMPT_WINDOW_SIZE={attempt_window_size}, ACCURACY_WEIGHT={accuracy_weight}")
    return mongo_uri, attempt_window_size, accuracy_weight


def compute_wma(attempts_window: List[Dict[str, Any]], weight: float) -> float:
    if not attempts_window:
        return 0.0
    # sort by timestamp ascending (oldest -> newest)
    attempts_window_sorted = sorted(attempts_window, key=lambda x: x['timestamp'])
    m = len(attempts_window_sorted)
    numerator = 0.0
    denominator = 0.0
    for idx, point in enumerate(attempts_window_sorted):
        w = weight ** idx
        numerator += (point['value'] * w)
        denominator += w
    return (numerator / denominator) if denominator > 0 else 0.0


def ensure_topic_entry(user_doc: Dict[str, Any], topic_id: ObjectId) -> int:
    """Return index of the topic entry for topic_id; create if missing."""
    topics = user_doc.get('topics', [])
    for i, t in enumerate(topics):
        if str(t.get('topicId')) == str(topic_id):
            return i
    # Create a new topic entry
    topics.append({
        'topicId': topic_id,
        'attemptsWindow': [],
        'accuracyHistory': []
    })
    return len(topics) - 1


def process_snapshot(db, snapshot: Dict[str, Any], attempt_window_size: int, accuracy_weight: float) -> Dict[str, int]:
    user_id = snapshot['userId']
    questions_history = snapshot.get('questionsHistory', [])
    now = datetime.utcnow()

    # Upsert/get the UserTopicPerformance doc for this user
    utp = db.usertopicperformances.find_one({'userId': user_id})
    if not utp:
        utp = {
            'userId': user_id,
            'topics': [],
            'createdAt': now,
            'updatedAt': now,
        }
        utp_id = db.usertopicperformances.insert_one(utp).inserted_id
        utp['_id'] = utp_id

    topics_changed = set()
    questions_processed = 0
    skipped_questions = 0
    attempts_added = 0

    for entry in questions_history:
        # Skip if correctOption missing
        if entry.get('correctOption', None) is None:
            skipped_questions += 1
            continue
        is_correct = 1 if entry.get('userOptionChoice') == entry.get('correctOption') else 0
        applied_to_topics = 0
        for topic in (entry.get('topics') or []):
            topic_id = topic.get('topicId')
            if not topic_id:
                continue
            idx = ensure_topic_entry(utp, topic_id)
            # Push attempt
            utp['topics'][idx]['attemptsWindow'].append({
                'timestamp': now,
                'value': is_correct
            })
            # Enforce window size
            aw = utp['topics'][idx]['attemptsWindow']
            if len(aw) > attempt_window_size:
                utp['topics'][idx]['attemptsWindow'] = aw[-attempt_window_size:]
            topics_changed.add(idx)
            applied_to_topics += 1
        attempts_added += applied_to_topics
        questions_processed += 1 if applied_to_topics > 0 else 0

    # After applying all attempts from this snapshot, compute one WMA update per touched topic
    for idx in topics_changed:
        aw = utp['topics'][idx]['attemptsWindow']
        wma = compute_wma(aw, accuracy_weight)
        utp['topics'][idx]['accuracyHistory'].append({
            'timestamp': now,
            'accuracy': wma
        })

    if topics_changed:
        utp['updatedAt'] = now
        # Write back entire doc (simple, safe for low volume worker)
        db.usertopicperformances.replace_one({'_id': utp['_id']}, utp)
    return {
        'questions_processed': questions_processed,
        'skipped_questions': skipped_questions,
        'attempts_added': attempts_added,
        'topics_touched': len(topics_changed)
    }


def main():
    logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(message)s')
    mongo_uri, attempt_window_size, accuracy_weight = load_config()
    client = MongoClient(mongo_uri)
    db = client.get_default_database()  # projectx from URI
    logging.info(f"Connected to MongoDB database: {db.name}")

    while True:
        try:
            # Atomically claim the oldest pending snapshot: status 0 -> 1
            claimed = db.userlevelsessionperformances.find_one_and_update(
                {'status': 0},
                {'$set': {'status': 1}},
                sort=[('createdAt', 1)],
                return_document=ReturnDocument.AFTER
            )

            if not claimed:
                time.sleep(10)
                continue

            logging.info(f"Claimed snapshot _id={claimed['_id']} userId={claimed.get('userId')} history_count={len(claimed.get('questionsHistory', []))}")
            # Process it
            try:
                result = process_snapshot(db, claimed, attempt_window_size, accuracy_weight)
            except Exception as e:
                # mark failed
                db.userlevelsessionperformances.update_one({'_id': claimed['_id']}, {'$set': {'status': -1, 'error': str(e)}})
                logging.exception(f"Processing failed for snapshot _id={claimed['_id']}")
                continue

            # Mark as processed
            db.userlevelsessionperformances.update_one({'_id': claimed['_id']}, {'$set': {'status': 2}})
            logging.info(
                f"Processed snapshot _id={claimed['_id']} | questions={result['questions_processed']} "
                f"skipped={result['skipped_questions']} attempts_added={result['attempts_added']} "
                f"topics_touched={result['topics_touched']}"
            )

        except Exception as outer:
            # Backoff a bit on unexpected errors
            logging.exception("Worker loop error")
            time.sleep(10)


if __name__ == '__main__':
    main()


