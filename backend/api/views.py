from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.db import models
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Profile, Chat,Message
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync



@api_view(["POST"])
def register(request):
    username = request.data.get("username")
    email = request.data.get("email")
    password = request.data.get("password")
    avatar = request.FILES.get("avatar")

    if User.objects.filter(username=username).exists():
        return Response({"error": "User exists"}, status=400)

    user = User.objects.create_user(
        username=username,
        email=email,
        password=password
    )

    Profile.objects.create(user=user, avatar=avatar)

    avatar_url = ""
    if avatar:
        avatar_url = request.build_absolute_uri(user.profile.avatar.url)

    return Response({
        "id": user.id,
        "username": user.username,
        "avatar": avatar_url,
    })


@api_view(["POST"])
def login(request):
    username = request.data.get("username")
    password = request.data.get("password")

    user = authenticate(username=username, password=password)

    if not user:
        return Response({"error": "Invalid credentials"}, status=401)

    profile, _ = Profile.objects.get_or_create(user=user)

    avatar_url = ""
    if profile.avatar:
        avatar_url = request.build_absolute_uri(profile.avatar.url)

    return Response({
        "id": user.id,
        "username": user.username,
        "avatar": avatar_url,
    })


@api_view(["GET"])
def search_users(request):
    query = request.GET.get("q", "")
    current_user_id = request.GET.get("current_user_id")

    users = User.objects.filter(username__icontains=query)

    if current_user_id:
        users = users.exclude(id=current_user_id)

    result = []
    for user in users:
        profile, _ = Profile.objects.get_or_create(user=user)
        avatar = request.build_absolute_uri(profile.avatar.url) if profile.avatar else ""

        result.append({
            "id": user.id,
            "username": user.username,
            "avatar": avatar,
        })

    return Response(result)
   


@api_view(["POST"])
def add_chat(request):
    user_id = request.data.get("user_id")
    target_id = request.data.get("target_user_id")

    if not user_id or not target_id:
        return Response({"error": "Invalid IDs"}, status=400)

    if user_id == target_id:
        return Response({"error": "Same user"}, status=400)

    try:
        u1 = User.objects.get(id=int(user_id))
        u2 = User.objects.get(id=int(target_id))
    except (User.DoesNotExist, ValueError):
        return Response({"error": "User not found"}, status=404)

    if u1.id > u2.id:
        u1, u2 = u2, u1

    chat, _ = Chat.objects.get_or_create(user1=u1, user2=u2)

    profile, _ = Profile.objects.get_or_create(user=u2)
    avatar = request.build_absolute_uri(profile.avatar.url) if profile.avatar else ""

    return Response({
        "chat_id": chat.id,
        "user": {
            "id": u2.id,
            "username": u2.username,
            "avatar": avatar,
        }
    })


@api_view(["GET"])
def get_chats(request):
    user_id = request.GET.get("user_id")
    if not user_id:
        return Response([])

    try:
        user = User.objects.get(id=int(user_id))
    except (User.DoesNotExist, ValueError):
        return Response([])

    chats = Chat.objects.filter(
        models.Q(user1=user) | models.Q(user2=user)
    )

    result = []
    for chat in chats:
        other = chat.user2 if chat.user1 == user else chat.user1
        profile, _ = Profile.objects.get_or_create(user=other)

        result.append({
            "chat_id": chat.id, 
            "id": other.id,
            "username": other.username,
            "avatar": request.build_absolute_uri(profile.avatar.url)
            if profile.avatar else "",
        })

    return Response(result)




@api_view(["POST"])
def remove_chat(request):
    user_id = request.data.get("user_id")
    target_user_id = request.data.get("target_user_id")

    if not user_id or not target_user_id:
        return Response({"error": "Invalid data"}, status=400)

    try:
        user1 = User.objects.get(id=int(user_id))
        user2 = User.objects.get(id=int(target_user_id))
    except (User.DoesNotExist, ValueError):
        return Response({"error": "User not found"}, status=404)

    if user1.id > user2.id:
        user1, user2 = user2, user1

    Chat.objects.filter(user1=user1, user2=user2).delete()

    return Response({"success": True})




@api_view(["GET"])
def get_messages(request):
    chat_id = request.GET.get("chat_id")

    messages = Message.objects.filter(chat_id=chat_id).order_by("created_at")

    return Response([
        {
            "id": m.id,
            "text": m.text,
            "image": request.build_absolute_uri(m.image.url) if m.image else None,
            "sender": m.sender.id,
            "created_at": m.created_at.isoformat(),
        }
        for m in messages
    ])


from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view

@csrf_exempt
@api_view(["POST"])
def send_image(request):
    chat_id = request.data.get("chat_id")
    sender_id = request.data.get("sender_id")
    image = request.FILES.get("image")

    if not chat_id or not sender_id or not image:
        return Response({"error": "Invalid data"}, status=400)

    chat = Chat.objects.get(id=chat_id)

    msg = Message.objects.create(
        chat=chat,
        sender_id=sender_id,
        image=image
    )

    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"chat_{chat_id}",
        {
            "type": "chat_message",
            "id": msg.id,
            "image": request.build_absolute_uri(msg.image.url),
            "sender": int(sender_id),
            "created_at": msg.created_at.isoformat(),
        }
    )

    return Response({"success": True})

