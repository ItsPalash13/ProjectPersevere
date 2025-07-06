#!/usr/bin/env python3
"""
Daily Aggregation Service - Phase 3
Continuous running script that processes UserLevelSessionTopicsLogs with status 1
and merges them into UserChapterLevelTopicsPerformanceLogs
"""

import os
import time
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any
from pymongo import MongoClient
from bson import ObjectId
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('daily_aggregation.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class DailyAggregationService:
    def __init__(self):
        """Initialize the aggregation service with database connection"""
        self.mongo_uri = os.getenv('MONGO_URI')
        if not self.mongo_uri:
            raise ValueError("MONGO_URI environment variable not found")
        
        self.client = MongoClient(self.mongo_uri)
        self.db = self.client.projectx
        
        # Collections
        self.session_logs = self.db.userlevelsessiontopicslogs
        self.performance_logs = self.db.userchapterlevelstopicsperformancelogs
        
        # Log total documents at startup
        total_session_logs = self.session_logs.count_documents({})
        total_performance_logs = self.performance_logs.count_documents({})
        
        logger.info(f"Daily Aggregation Service initialized")
        logger.info(f"Total session logs: {total_session_logs}")
        logger.info(f"Total performance logs: {total_performance_logs}")
    
    def process_completed_sessions(self) -> int:
        """
        Process one UserLevelSessionTopicsLogs with status 1 using atomic find and update
        Returns number of processed documents (0 or 1)
        """
        try:
            # Atomically find one session with status 1 and update to status 2
            completed_session = self.session_logs.find_one_and_update(
                {"status": 1},
                {"$set": {"status": 2}},
                return_document=True  # Return the updated document
            )
            
            if not completed_session:
                # Check what sessions exist for debugging
                total_sessions = self.session_logs.count_documents({})
                status_0_count = self.session_logs.count_documents({"status": 0})
                status_1_count = self.session_logs.count_documents({"status": 1})
                status_2_count = self.session_logs.count_documents({"status": 2})
                status_neg1_count = self.session_logs.count_documents({"status": -1})
                
                logger.info(f"No sessions with status 1 found. Current counts - Total: {total_sessions}, Status 0: {status_0_count}, Status 1: {status_1_count}, Status 2: {status_2_count}, Status -1: {status_neg1_count}")
                return 0
            
            logger.info(f"Processing session: {completed_session['_id']}")
            
            try:
                # Process single session and upsert to daily log
                self._process_single_session(completed_session)
                
                logger.info(f"Successfully processed session: {completed_session['_id']}")
                return 1
                
            except Exception as e:
                logger.error(f"Error processing session {completed_session['_id']}: {e}")
                # Set status to -1 if processing failed
                self.session_logs.update_one(
                    {"_id": completed_session['_id']},
                    {"$set": {"status": -1}}
                )
                return 0
            
        except Exception as e:
            logger.error(f"Error in process_completed_sessions: {e}")
            return 0
    
    def _process_single_session(self, session: Dict):
        """
        Process a single session and upsert into daily performance log
        """
        # Extract date from session
        created_at = session.get('createdAt')
        if isinstance(created_at, datetime):
            date_obj = created_at.date()
        else:
            date_obj = datetime.now().date()
        
        user_chapter_level_id = session['userChapterLevelId']
        
        # Aggregate data from single session
        aggregated_data = self._aggregate_session_data([session])
        
        # Use upsert to atomically update or create daily performance log
        date_start = datetime.combine(date_obj, datetime.min.time())
        date_end = datetime.combine(date_obj + timedelta(days=1), datetime.min.time())
        
        result = self.performance_logs.find_one_and_update(
            {
                "userChapterLevelId": user_chapter_level_id,
                "topics": aggregated_data['topics'],  # Exact topic match for unique document
                "date": {"$gte": date_start, "$lt": date_end}
            },
            {
                "$setOnInsert": {
                    "userChapterLevelId": user_chapter_level_id,
                    "date": date_start,
                    "topics": aggregated_data['topics'],  # Set exact topics on insert
                    "createdAt": datetime.now()
                },
                "$push": {
                    "questionsAnswered": {"$each": aggregated_data['questionsAnswered']}
                },
                "$inc": {
                    "totalSessions": aggregated_data['totalSessions']
                },
                "$currentDate": {
                    "updatedAt": True
                }
            },
            upsert=True,
            return_document=True
        )
        
        if result:
            logger.info(f"Upserted daily log for date {date_obj}: {result['_id']}")
        else:
            logger.error(f"Failed to upsert daily log for date {date_obj}")
    

    
    def _aggregate_session_data(self, sessions: List[Dict]) -> Dict[str, Any]:
        """
        Aggregate data from single session (topics should remain as exact set)
        """
        if not sessions:
            return {"topics": [], "questionsAnswered": [], "totalSessions": 0}
        
        # For single session, keep exact topic set
        session = sessions[0]
        topics = session.get('topics', [])
        
        # Convert topics to ObjectId if they're strings
        topic_ids = []
        for topic in topics:
            if isinstance(topic, str):
                topic_ids.append(ObjectId(topic))
            else:
                topic_ids.append(topic)
        
        # Collect all questions
        questions = session.get('questionsAnswered', [])
        if not isinstance(questions, list):
            questions = []
        
        return {
            "topics": topic_ids,  # Exact topic set as ObjectIds
            "questionsAnswered": questions,
            "totalSessions": 1
        }
    

    
    def run_continuous(self, interval_seconds: int = 10):
        """
        Run the aggregation service continuously
        """
        logger.info(f"Starting continuous aggregation service (interval: {interval_seconds}s)")
        
        while True:
            try:
                processed_count = self.process_completed_sessions()
                
                if processed_count > 0:
                    logger.info(f"Processing cycle completed. Processed {processed_count} session.")
                else:
                    logger.debug("No sessions to process in this cycle")
                
                # Wait before next cycle
                time.sleep(interval_seconds)
                
            except KeyboardInterrupt:
                logger.info("Received interrupt signal. Shutting down...")
                break
            except Exception as e:
                logger.error(f"Unexpected error in continuous run: {e}")
                # Wait a bit longer on error to avoid rapid retries
                time.sleep(interval_seconds * 2)
    
    def close(self):
        """Close database connection"""
        if self.client:
            self.client.close()
            logger.info("Database connection closed")

def main():
    """Main function to run the aggregation service"""
    service = None
    try:
        service = DailyAggregationService()
        
        # Run continuously with 10-second intervals
        service.run_continuous(interval_seconds=10)
        
    except Exception as e:
        logger.error(f"Failed to start aggregation service: {e}")
    finally:
        if service:
            service.close()

if __name__ == "__main__":
    main() 