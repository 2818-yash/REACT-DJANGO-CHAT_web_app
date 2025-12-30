import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import Chat, Message

User = get_user_model()


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.chat_id = int(self.scope["url_route"]["kwargs"]["chat_id"])
        self.room_group_name = f"chat_{self.chat_id}"

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)

        # ✅ FIXED KEYS
        text = data.get("text", "")
        sender_id = data.get("sender")

        if not text or not sender_id:
            return

        msg = await self.save_message(sender_id, text)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "id": msg.id,
                "text": msg.text,                     # ✅ FIXED
                "sender": sender_id,
                "created_at": msg.created_at.isoformat(),
            }
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event))

    # ==========================
    # DATABASE
    # ==========================
    @database_sync_to_async
    def save_message(self, sender_id, text):
        chat = Chat.objects.get(id=self.chat_id)
        sender = User.objects.get(id=sender_id)

        return Message.objects.create(
            chat=chat,
            sender=sender,
            text=text
        )
