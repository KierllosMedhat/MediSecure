from notifications.models import Notification
from notifications.serializers import NotificationCreateSerializer
import logging

logger = logging.getLogger(__name__)

def create_notification(user, notification_type, subject, content, channel=Notification.Channel.IN_APP):
    """
    Utility function to create and dispatch a notification.
    
    Args:
        user: User instance
        notification_type: str (e.g., 'APPOINTMENT', 'RECORD')
        subject: str
        content: str
        channel: str (e.g., 'IN_APP', 'EMAIL')
        
    Returns:
        Notification instance or None on error.
    """
    serializer = NotificationCreateSerializer(data={
        "user": user.id,
        "notification_type": notification_type,
        "channel": channel,
        "subject": subject,
        "content": content
    })
    
    if serializer.is_valid():
        return serializer.save()
    else:
        logger.error(f"Failed to create notification: {serializer.errors}")
        return None
