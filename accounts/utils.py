from django.core.mail import EmailMessage
import random
import threading
from django.conf import settings
from .models import User, OneTimePassword
from django.contrib.sites.shortcuts import get_current_site

class EmailThread(threading.Thread):
    def __init__(self, email):
        self.email = email
        threading.Thread.__init__(self)

    def run(self):
        self.email.send()

def send_generated_otp_to_email(email, request): 
    subject = "One Time Passcode for Email Verification"
    otp = random.randint(1000, 9999) 
    current_site = get_current_site(request).domain
    
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        # Handle the case where the user does not exist
        print(f"User with email {email} does not exist.")
        return

    email_body = f"Hi {user.first_name}, thanks for signing up on {current_site}. Please verify your email with the one-time passcode: {otp}"
    from_email = settings.EMAIL_HOST_USER 
    otp_obj = OneTimePassword.objects.create(user=user, otp=otp)
    d_email = EmailMessage(subject=subject, body=email_body, from_email=from_email, to=[user.email])
    EmailThread(d_email).start()

def send_normal_email(data):
    email = EmailMessage(
        subject=data['email_subject'],
        body=data['email_body'],
        from_email=settings.EMAIL_HOST_USER,
        to=[data['to_email']]
    )
    EmailThread(email).start()
