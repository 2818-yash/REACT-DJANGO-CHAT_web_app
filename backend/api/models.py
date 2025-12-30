from django.contrib.auth.models import User
from django.db import models
from django.db.models import Q


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)

    def __str__(self):
        return self.user.username


class Chat(models.Model):
    user1 = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="chats_as_user1"
    )
    user2 = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="chats_as_user2"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user1", "user2"],
                name="unique_chat_users"
            )
        ]

    def save(self, *args, **kwargs):
        # 🔒 ENFORCE ORDER (VERY IMPORTANT)
        if self.user1_id > self.user2_id:
            self.user1, self.user2 = self.user2, self.user1
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Chat {self.user1} ↔ {self.user2}"


class Message(models.Model):
    chat = models.ForeignKey(
        Chat,
        related_name="messages",
        on_delete=models.CASCADE
    )
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    text = models.TextField(blank=True)
    image = models.ImageField(
        upload_to="chat_images/",
        blank=True,
        null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.sender.username}: {self.text[:30]}"


class BlockedUser(models.Model):
    blocker = models.ForeignKey(
        User, related_name="blocked_users", on_delete=models.CASCADE
    )
    blocked = models.ForeignKey(
        User, related_name="blocked_by", on_delete=models.CASCADE
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("blocker", "blocked")