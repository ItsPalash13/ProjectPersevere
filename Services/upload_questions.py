import json
import sys
from bson import ObjectId
from pymongo import MongoClient
import os
import logging
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

def delete_existing_questions(chapter_id, question_collection, question_ts_collection):
    """Delete existing questions and their associated questionTs for a given chapter"""
    existing_questions = list(question_collection.find({"chapterId": chapter_id}, {"_id": 1}))
    existing_ids = [q["_id"] for q in existing_questions]

    if existing_ids:
        delete_q = question_collection.delete_many({"_id": {"$in": existing_ids}})
        delete_ts = question_ts_collection.delete_many({"quesId": {"$in": existing_ids}})
        print(f"🗑️ Deleted {delete_q.deleted_count} questions and {delete_ts.deleted_count} questionTs for chapterId {chapter_id}")
        return len(existing_ids)
    else:
        print("ℹ️ No existing questions found for this chapter. Proceeding to insert new ones.")
        return 0

def insert_questions(questions, chapter_id, question_collection, question_ts_collection, topic_lookup):
    """Insert new questions and their associated questionTs"""
    inserted_count = 0

    for q in questions:
        try:
            # Resolve topics
            resolved_topics = []
            for topic_name in q["topics"]:
                if topic_name not in topic_lookup:
                    raise ValueError(f"❌ Topic '{topic_name}' not found for chapterId {chapter_id}")
                resolved_topics.append({
                    "id": topic_lookup[topic_name],
                    "name": topic_name
                })

            # Insert into 'questions'
            ques_doc = {
                "ques": q["ques"],
                "options": q["options"],
                "correct": q["correct"],
                "chapterId": chapter_id,
                "topics": resolved_topics
            }
            result = question_collection.insert_one(ques_doc)

            # Insert into 'questionsts'
            ques_ts_doc = {
                "quesId": result.inserted_id,
                "difficulty": {
                    "mu": q["difficulty"]["mu"]
                },
                "xp": q.get("xp", {"correct": 0, "incorrect": 0})
            }
            question_ts_collection.insert_one(ques_ts_doc)
            inserted_count += 1

        except Exception as e:
            print(f"⚠️ Skipping question due to error: {e}")
            continue

    print(f"✅ Successfully inserted {inserted_count} questions.")
    return inserted_count

def load_questions(chapter_id_str, file_path, delete_existing=True):
    # Connect to MongoDB
    logging.info(f"Connecting to MongoDB: {os.getenv('MONGO_URI')}")
    client = MongoClient(os.getenv('MONGO_URI'))
    db = client['projectx']
    question_collection = db['questions']
    question_ts_collection = db['questionsts']
    topics_collection = db['topics']

    chapter_id = ObjectId(chapter_id_str)

    # Step 1: Delete existing questions for this chapter (if requested)
    deleted_count = 0
    if delete_existing:
        deleted_count = delete_existing_questions(chapter_id, question_collection, question_ts_collection)
    else:
        print("ℹ️ Skipping deletion of existing questions (--no-delete flag used)")

    # Step 2: Build topic name -> ID lookup using 'topic' field
    topic_cursor = topics_collection.find({"chapterId": chapter_id}, {"_id": 1, "topic": 1})
    topic_lookup = {doc["topic"]: doc["_id"] for doc in topic_cursor}

    with open(file_path, 'r') as f:
        questions = json.load(f)

    # Step 3: Insert new questions
    inserted_count = insert_questions(questions, chapter_id, question_collection, question_ts_collection, topic_lookup)
    
    return {
        "deleted": deleted_count,
        "inserted": inserted_count
    }

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Upload questions for a chapter')
    parser.add_argument('chapter_id', help='Chapter ID to upload questions for')
    parser.add_argument('file_path', help='Path to the JSON file containing questions')
    parser.add_argument('--no-delete', action='store_true', help='Skip deletion of existing questions')
    
    args = parser.parse_args()
    
    logging.info(f"Loading questions from {args.file_path} for chapter {args.chapter_id}")
    result = load_questions(args.chapter_id, args.file_path, not args.no_delete)
    print(f"📊 Summary: Deleted {result['deleted']} questions, Inserted {result['inserted']} questions")


#python upload_questions.py 686923b0a6d909494cadaeaf questions/questions1.json
#python upload_questions.py 686923b0a6d909494cadaeaf questions/questions1.json --no-delete