import google.genai as genai
import os
from dotenv import load_dotenv
load_dotenv()


from pathlib import Path
# Current file is in app/services/
# .env is in app/
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

api_key = os.getenv("GEMINI_API_KEY") 


class GeminiService:
    def __init__(self):
        self.model = None
        self.chat_session = None
        self.system_prompt = """
        You are a Breast Health Information Assistant, a specialized medical AI assistant. 
        Your goal is to provide general advice and information based on breast cancer prediction results.
        
        Guidelines:
        1. Always be professional, empathetic, and clear.
        2. Explain medical terms in simple language.
        3. Do NOT provide definitive medical diagnoses. AI predictions are probabilistic.
        4. Always advise the user to consult with a qualified healthcare professional.
        5. If the prediction is Malignant or Benign, explain what that generally means and suggest next steps (e.g., biopsy, follow-up).
        6. If the prediction is Normal, encourage routine screening.
        
        Context: The user is using a web app that analyzes mammography images.
        """
        
        # Auto-configure if API key is present in environment
        if api_key:
            self.configure(api_key)

    def configure(self, api_key: str):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            system_prompt=self.system_prompt
        )

    def chat(self, message: str):
        if not self.model:
             return "Chat service not configured. Please check API key."
        
        response = self.model.generate_content(message)
        return response.text

gemini_service = GeminiService()
