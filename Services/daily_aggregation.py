#!/usr/bin/env python3
"""
Session Processing Service - Phase 3
Continuous running script that processes UserLevelSessionTopicsLogs with status 1
and creates UserChapterTopicsPerformanceLogs with exact timestamps
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

class SessionProcessingService:
    def __init__(self):
        """Initialize the aggregation service with database connection"""
        self.mongo_uri = os.getenv('MONGO_URI')
        if not self.mongo_uri:
            raise ValueError("MONGO_URI environment variable not found")
        
        self.client = MongoClient(self.mongo_uri)
        self.db = self.client.projectx
        
        # Collections
        self.session_logs = self.db.userlevelsessiontopicslogs
        self.performance_logs = self.db.userchaptertopicsperformancelogs
        
        # Log total documents at startup
        total_session_logs = self.session_logs.count_documents({})
        total_performance_logs = self.performance_logs.count_documents({})
        
        logger.info(f"Session Processing Service initialized")
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
                
                # Log recent failure reasons if there are failed sessions
                if status_neg1_count > 0:
                    self._log_recent_failures()
                return 0
            
            logger.info(f"Processing session: {completed_session['_id']}")
            
            try:
                # Process single session and upsert to daily log
                self._process_single_session(completed_session)
                
                logger.info(f"Successfully processed session: {completed_session['_id']}")
                return 1
                
            except Exception as e:
                error_message = str(e)
                logger.error(f"Error processing session {completed_session['_id']}: {error_message}")
                # Set status to -1 with failure reason if processing failed
                self.session_logs.update_one(
                    {"_id": completed_session['_id']},
                    {"$set": {
                        "status": -1,
                        "failureReason": f"Processing error: {error_message}"
                    }}
                )
                return 0
            
        except Exception as e:
            logger.error(f"Error in process_completed_sessions: {e}")
            return 0
    
    def _process_single_session(self, session: Dict):
        """
        Process a single session and create performance log with actual timestamp
        """
        # Use actual session timestamp instead of day start
        created_at = session.get('createdAt')
        if isinstance(created_at, datetime):
            session_timestamp = created_at
        else:
            session_timestamp = datetime.now()
        
        user_chapter_level_id = session['userChapterLevelId']
        
        # Aggregate data from single session
        aggregated_data = self._aggregate_session_data([session])
        
        # Create new record with exact timestamp - allows multiple records per session at different times
        result = self.performance_logs.find_one_and_update(
            {
                "userChapterLevelId": user_chapter_level_id,
                "userLevelSessionId": session['userLevelSessionId'],
                "topics": aggregated_data['topics'],
                "date": session_timestamp  # Use exact timestamp
            },
            {
                "$set": {
                    "userChapterLevelId": user_chapter_level_id,
                    "userLevelSessionId": session['userLevelSessionId'],
                    "date": session_timestamp,  # Store exact timestamp
                    "topics": aggregated_data['topics'],
                    "totalSessions": aggregated_data['totalSessions'],
                    "questionsAnswered": aggregated_data['questionsAnswered']
                },
                "$currentDate": {
                    "updatedAt": True
                },
                "$setOnInsert": {
                    "createdAt": datetime.now()
                }
            },
            upsert=True,
            return_document=True
        )
        
        if result:
            logger.info(f"Upserted performance log for session timestamp {session_timestamp}: {result['_id']}")
        else:
            logger.error(f"Failed to upsert performance log for session timestamp {session_timestamp}")
    

    
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
    
    def _log_recent_failures(self, limit: int = 5):
        """
        Log recent failed sessions with their failure reasons for debugging
        """
        try:
            failed_sessions = self.session_logs.find(
                {"status": -1},
                {"_id": 1, "failureReason": 1, "updatedAt": 1}
            ).sort("updatedAt", -1).limit(limit)
            
            failure_count = 0
            for session in failed_sessions:
                failure_reason = session.get('failureReason', 'No reason provided')
                updated_at = session.get('updatedAt', 'Unknown time')
                logger.warning(f"Failed session {session['_id']} at {updated_at}: {failure_reason}")
                failure_count += 1
            
            if failure_count > 0:
                logger.info(f"Logged {failure_count} recent failed sessions")
                
        except Exception as e:
            logger.error(f"Error logging recent failures: {e}")

    
    def run_continuous(self, interval_seconds: int = 10):
        """
        Run the aggregation service continuously
        """
        logger.info(f"Starting continuous session processing service (interval: {interval_seconds}s)")
        
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
    """Main function to run the session processing service"""
    service = None
    try:
        service = SessionProcessingService()
        
        # Run continuously with 5-second intervals
        service.run_continuous(interval_seconds=5)
        
    except Exception as e:
        logger.error(f"Failed to start session processing service: {e}")
    finally:
        if service:
            service.close()

if __name__ == "__main__":
    main() 