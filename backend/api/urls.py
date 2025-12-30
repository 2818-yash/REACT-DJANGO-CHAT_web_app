from django.urls import path
from .views import (
    register,
    login,
    search_users,
    add_chat,
    get_chats,
    remove_chat,
    get_messages,
    send_image,

    
)

urlpatterns = [
    path("register/", register),
    path("login/", login),
    path("users/search/", search_users),
    path("chats/add/", add_chat),
    path("chats/", get_chats),
    path("chats/remove/", remove_chat),
    path("messages/", get_messages),
    path("messages/image/", send_image),




]
