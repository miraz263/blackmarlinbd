from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string


@shared_task(bind=True, max_retries=3)
def send_contact_notification(self, contact_id: int):
    """Send email notification when a new contact form is submitted."""
    from .models import Contact

    try:
        contact = Contact.objects.get(pk=contact_id)
        subject = f"New Contact: {contact.subject}"
        message = (
            f"Name: {contact.name}\n"
            f"Email: {contact.email}\n"
            f"Phone: {contact.phone or 'N/A'}\n"
            f"Company: {contact.company or 'N/A'}\n"
            f"Service: {contact.get_service_display()}\n"
            f"Budget: {contact.budget or 'N/A'}\n\n"
            f"Message:\n{contact.message}"
        )
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[settings.EMAIL_HOST_USER],
            fail_silently=False,
        )

        # Send auto-reply to the user
        send_mail(
            subject="Thank you for contacting BlackMarlinBD",
            message=(
                f"Dear {contact.name},\n\n"
                "Thank you for reaching out to BlackMarlinBD. We have received your message "
                "and our team will get back to you within 24-48 business hours.\n\n"
                "Best regards,\nBlackMarlinBD Team"
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[contact.email],
            fail_silently=True,
        )
    except Exception as exc:
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))
