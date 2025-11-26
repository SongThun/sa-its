"""
Core API URLs.
RESTful routing for shared core resources (Topics, ModuleItems).
"""

from django.urls import path
from . import views

app_name = "core"

urlpatterns = [
    # ========================================================================
    # TOPIC ENDPOINTS
    # ========================================================================
    path("topics/", views.TopicListView.as_view(), name="topic-list"),
    path("topics/<uuid:pk>/", views.TopicDetailView.as_view(), name="topic-detail"),
    path("topics/create/", views.TopicCreateView.as_view(), name="topic-create"),
    path(
        "topics/<uuid:pk>/update/", views.TopicUpdateView.as_view(), name="topic-update"
    ),
    path(
        "topics/<uuid:pk>/delete/", views.TopicDeleteView.as_view(), name="topic-delete"
    ),
    path(
        "topics/<uuid:pk>/courses/",
        views.TopicCoursesView.as_view(),
        name="topic-courses",
    ),
    # ========================================================================
    # MODULE ITEM ENDPOINTS
    # ========================================================================
    path(
        "modules/<uuid:module_id>/items/",
        views.ModuleItemListView.as_view(),
        name="module-items-list",
    ),
    path(
        "modules/<uuid:module_id>/items/create/",
        views.ModuleItemCreateView.as_view(),
        name="module-items-create",
    ),
    path(
        "modules/<uuid:module_id>/items/reorder/",
        views.ModuleItemReorderView.as_view(),
        name="module-items-reorder",
    ),
    path(
        "module-items/<uuid:pk>/",
        views.ModuleItemDeleteView.as_view(),
        name="module-item-delete",
    ),
    path(
        "module-items/<uuid:pk>/move/",
        views.ModuleItemMoveView.as_view(),
        name="module-item-move",
    ),
]
