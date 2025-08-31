import smtplib
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from config import settings
from datetime import datetime

logger = logging.getLogger(__name__)

def send_email(to_email: str, subject: str, body: str):
    try:
        msg = MIMEMultipart()
        msg['From'] = settings.EMAIL_SENDER
        msg['To'] = to_email
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'html'))
        
        with smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT) as server:
            if settings.SMTP_USE_TLS:
                server.starttls()
            server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            server.send_message(msg)
        logger.info(f"Email sent to {to_email}")
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")
        raise RuntimeError(f"Email sending failed: {str(e)}")

def send_verification_email(email: str, verification_link: str):
    subject = "Verify Your Email Address"
    body = f"""
    <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="background: linear-gradient(135deg, #8b5cf6, #38b6ff); padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">Welcome to Our Platform!</h1>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            <p>Thank you for signing up! Please verify your email address to get started:</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{verification_link}" style="display: inline-block; background: linear-gradient(135deg, #8b5cf6, #38b6ff); color: white; text-decoration: none; padding: 12px 30px; border-radius: 30px; font-weight: bold; letter-spacing: 0.5px; transition: all 0.3s ease;">
                    Verify Email
                </a>
            </div>
            
            <p>If you didn't create an account, you can safely ignore this email.</p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #777; font-size: 0.9em;">
                <p>© {datetime.now().year} Your Company. All rights reserved.</p>
            </div>
        </div>
    </div>
    """
    try:
        send_email(email, subject, body)
    except Exception as e:
        logger.error(f"Verification email failed for {email}: {str(e)}")

def send_password_reset_email(email: str, reset_link: str):
    subject = "Password Reset Request"
    body = f"""
    <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="background: linear-gradient(135deg, #8b5cf6, #38b6ff); padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">Password Reset</h1>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            <p>We received a request to reset your password. Click the button below to reset it:</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{reset_link}" style="display: inline-block; background: linear-gradient(135deg, #8b5cf6, #38b6ff); color: white; text-decoration: none; padding: 12px 30px; border-radius: 30px; font-weight: bold; letter-spacing: 0.5px; transition: all 0.3s ease;">
                    Reset Password
                </a>
            </div>
            
            <p>This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.</p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #777; font-size: 0.9em;">
                <p>© {datetime.now().year} Your Company. All rights reserved.</p>
            </div>
        </div>
    </div>
    """
    try:
        send_email(email, subject, body)
    except Exception as e:
        logger.error(f"Password reset email failed for {email}: {str(e)}")