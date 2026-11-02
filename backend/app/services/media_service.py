import os
import io
import tempfile
from pathlib import Path
from typing import Optional

# OCR
try:
    import pytesseract
    from PIL import Image
    OCR_AVAILABLE = True
except ImportError:
    OCR_AVAILABLE = False

# Speech recognition
try:
    import speech_recognition as sr
    SPEECH_AVAILABLE = True
except ImportError:
    SPEECH_AVAILABLE = False

try:
    from pydub import AudioSegment
    PYDUB_AVAILABLE = True
except ImportError:
    PYDUB_AVAILABLE = False


def extract_text_from_image(image_bytes: bytes, filename: str = "") -> dict:
    """Extract text from image using OCR (Tesseract)."""
    if not OCR_AVAILABLE:
        return {
            "success": False,
            "text": "",
            "error": "OCR service not available. Please install pytesseract and Tesseract-OCR.",
            "method": "none"
        }

    try:
        img = Image.open(io.BytesIO(image_bytes))
        # Convert to RGB if needed
        if img.mode not in ("RGB", "L"):
            img = img.convert("RGB")

        # Try Hindi + English OCR
        try:
            text = pytesseract.image_to_string(img, lang="eng+hin", config="--psm 6")
        except Exception:
            text = pytesseract.image_to_string(img, lang="eng", config="--psm 6")

        text = text.strip()
        if not text:
            return {
                "success": False,
                "text": "",
                "error": "Could not extract text from this image. Please ensure the image contains readable text.",
                "method": "tesseract"
            }

        return {
            "success": True,
            "text": text,
            "error": None,
            "method": "tesseract",
            "char_count": len(text),
            "word_count": len(text.split())
        }
    except Exception as e:
        return {
            "success": False,
            "text": "",
            "error": f"Image processing error: {str(e)}",
            "method": "tesseract"
        }


def transcribe_audio(audio_bytes: bytes, filename: str = "", language: str = "en") -> dict:
    """Transcribe audio recording using SpeechRecognition."""
    if not SPEECH_AVAILABLE:
        return {
            "success": False,
            "text": "",
            "error": "Speech recognition service not available.",
            "method": "none"
        }

    try:
        lang_code = "hi-IN" if language == "hi" else "en-IN"
        suffix = Path(filename).suffix.lower() if filename else ".wav"

        with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
            tmp.write(audio_bytes)
            tmp_path = tmp.name

        # Convert to WAV if needed
        wav_path = tmp_path
        if suffix in (".mp3", ".m4a", ".webm", ".ogg") and PYDUB_AVAILABLE:
            fmt = suffix.lstrip(".")
            if fmt == "m4a":
                fmt = "mp4"
            audio = AudioSegment.from_file(tmp_path, format=fmt)
            wav_path = tmp_path.replace(suffix, ".wav")
            audio.export(wav_path, format="wav")

        recognizer = sr.Recognizer()
        with sr.AudioFile(wav_path) as source:
            audio_data = recognizer.record(source)

        # Try Google Web Speech API (free)
        try:
            text = recognizer.recognize_google(audio_data, language=lang_code)
        except sr.UnknownValueError:
            text = ""
        except sr.RequestError:
            # Try alternative
            try:
                text = recognizer.recognize_sphinx(audio_data)
            except Exception:
                text = ""

        # Cleanup
        for p in [tmp_path, wav_path]:
            try:
                os.unlink(p)
            except Exception:
                pass

        if not text:
            return {
                "success": False,
                "text": "",
                "error": "Could not transcribe the audio. Please ensure the recording has clear speech.",
                "method": "google_speech"
            }

        return {
            "success": True,
            "text": text,
            "error": None,
            "method": "google_speech",
            "language": lang_code,
            "word_count": len(text.split())
        }

    except Exception as e:
        return {
            "success": False,
            "text": "",
            "error": f"Audio processing error: {str(e)}",
            "method": "speech_recognition"
        }
