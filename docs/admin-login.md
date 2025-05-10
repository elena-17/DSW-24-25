# ADMIN - LOGIN

An administrator can’t register with that role; it can only register as user and later be upgraded to role “admin”. Therefore, we need a superuser. This can be created with the following command on Django's `backend_main`:

```bash
python manage.py createsuperuser
```

If you are using the docker installation (without defining your own credientials), the superuser credentials are:

```
Email: admin@example.com

Password: SecurePassword1
```

> [!IMPORTANT]
> For new administrators, register as user and then request the another admin to upgrade your role to admin.
