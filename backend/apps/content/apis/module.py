from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny

from apps.content.serializers import ModuleSerializer, ModuleModelSerializer
from apps.content.permissions import IsInstructor, IsOwner
from apps.content.services import ContentFacade, ModuleService

facade = ContentFacade()
module_service = ModuleService()


class ModuleViewSet(viewsets.ModelViewSet):
    permission_classes = [IsInstructor, IsOwner]

    def get_serializer_class(self):
        actions = {
            "list": ModuleSerializer,
            "retrieve": ModuleSerializer,
            "create": ModuleModelSerializer,
            "update": ModuleModelSerializer,
            "partial_update": ModuleModelSerializer,
        }
        return actions.get(self.action, ModuleSerializer)

    def get_queryset(self):
        return module_service.get_by_instructor(self.request.user)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        course_id = request.data.get("course_id")
        if not course_id:
            return Response(
                {"error": "course_id is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        module = facade.add_module_to_course(
            instructor=request.user,
            course_id=course_id,
            data=serializer.validated_data,
        )

        if not module:
            return Response(
                {"detail": "Course not found or you don't have permission"},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = ModuleSerializer(module, context=self.get_serializer_context())
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)

        # Validate ownership through service
        module, validated_data = facade.resolve_module_update(
            instructor=request.user,
            module_id=kwargs.get("pk"),
            data=request.data,
        )

        if not module:
            return Response(
                {"detail": "Module not found or you don't have permission"},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Use serializer to update with validated data
        serializer = self.get_serializer(module, data=validated_data, partial=partial)
        serializer.is_valid(raise_exception=True)
        module = serializer.save()

        response_serializer = ModuleSerializer(
            module, context=self.get_serializer_context()
        )
        return Response(response_serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"])
    def publish(self, request, pk=None):
        module = self.get_object()
        module_service.publish(module)
        return Response({"detail": f"Module '{module.title}' published"})

    @action(detail=True, methods=["post"])
    def unpublish(self, request, pk=None):
        module = self.get_object()
        module_service.unpublish(module)
        return Response({"detail": f"Module '{module.title}' unpublished"})


class CourseModulesView(APIView):
    """List modules for a specific course (public endpoint)."""

    permission_classes = [AllowAny]

    def get(self, request, course_id):
        course, modules = facade.get_course_modules_for_user(course_id, request.user)
        if course is None:
            return Response(
                {"error": "Course not found"}, status=status.HTTP_404_NOT_FOUND
            )

        serializer = ModuleSerializer(modules, many=True, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)
