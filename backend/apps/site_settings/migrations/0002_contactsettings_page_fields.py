from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("site_settings", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="contactsettings",
            name="page_title",
            field=models.CharField(blank=True, default="Let's Build Together", max_length=200),
        ),
        migrations.AddField(
            model_name="contactsettings",
            name="page_subtitle",
            field=models.CharField(
                blank=True,
                default="Tell us about your project. We'll get back to you within 24 hours.",
                max_length=400,
            ),
        ),
        migrations.AddField(
            model_name="contactsettings",
            name="response_time_text",
            field=models.CharField(blank=True, default="⚡ We respond within 24 hours", max_length=200),
        ),
        migrations.AddField(
            model_name="contactsettings",
            name="response_time_desc",
            field=models.CharField(blank=True, default="For urgent inquiries, call us directly.", max_length=300),
        ),
    ]
