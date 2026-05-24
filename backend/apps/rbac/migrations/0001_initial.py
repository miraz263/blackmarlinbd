from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Permission",
            fields=[
                ("id",       models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("module",   models.CharField(max_length=50)),
                ("action",   models.CharField(max_length=20)),
                ("codename", models.CharField(db_index=True, max_length=100, unique=True)),
                ("name",     models.CharField(max_length=200)),
            ],
            options={
                "verbose_name": "Permission",
                "verbose_name_plural": "Permissions",
                "db_table": "rbac_permissions",
                "ordering": ["module", "action"],
                "unique_together": {("module", "action")},
            },
        ),
        migrations.CreateModel(
            name="Role",
            fields=[
                ("id",          models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at",  models.DateTimeField(auto_now_add=True, db_index=True)),
                ("updated_at",  models.DateTimeField(auto_now=True)),
                ("name",        models.CharField(max_length=100, unique=True)),
                ("slug",        models.SlugField(unique=True)),
                ("description", models.TextField(blank=True)),
                ("is_system",   models.BooleanField(default=False, help_text="System roles cannot be deleted via the API")),
                ("permissions", models.ManyToManyField(blank=True, related_name="roles", to="rbac.permission")),
            ],
            options={
                "verbose_name": "Role",
                "verbose_name_plural": "Roles",
                "db_table": "rbac_roles",
                "ordering": ["name"],
            },
        ),
        migrations.CreateModel(
            name="UserRole",
            fields=[
                ("id",          models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at",  models.DateTimeField(auto_now_add=True, db_index=True)),
                ("updated_at",  models.DateTimeField(auto_now=True)),
                ("user",        models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name="userrole", to=settings.AUTH_USER_MODEL)),
                ("role",        models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="user_roles", to="rbac.role")),
                ("assigned_by", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="assigned_roles", to=settings.AUTH_USER_MODEL)),
            ],
            options={
                "verbose_name": "User Role Assignment",
                "verbose_name_plural": "User Role Assignments",
                "db_table": "rbac_user_roles",
            },
        ),
    ]
