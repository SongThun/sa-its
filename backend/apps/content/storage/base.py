from abc import ABC, abstractmethod


class StorageRegistry:
    _handlers: dict = {}

    @classmethod
    def register(cls, handler_class):
        if handler_class.storage_type:
            cls._handlers[handler_class.storage_type] = handler_class
        return handler_class

    @classmethod
    def get_handler(cls, storage_type: str):
        handler_class = cls._handlers.get(storage_type)
        if handler_class:
            return handler_class()
        return None

    @classmethod
    def get_all_handlers(cls) -> dict:
        return {k: v() for k, v in cls._handlers.items()}


class ContentStorage(ABC):
    storage_type: str = ""

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        if cls.storage_type:
            StorageRegistry.register(cls)

    @abstractmethod
    def store(self, content_data: dict) -> dict:
        pass

    @abstractmethod
    def retrieve(self, storage_metadata: dict) -> dict:
        pass

    @abstractmethod
    def delete(self, storage_metadata: dict) -> bool:
        pass

    @abstractmethod
    def validate(self, content_data: dict) -> bool:
        pass
