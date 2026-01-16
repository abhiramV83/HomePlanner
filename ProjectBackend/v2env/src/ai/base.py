from abc import abstractmethod,ABC
class AIplatform(ABC):
    @abstractmethod
    def chat(self,prompt:str)->str:
        pass