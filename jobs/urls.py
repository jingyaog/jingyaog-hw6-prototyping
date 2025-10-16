from django.urls import path
from . import views

app_name = 'jobs'

urlpatterns = [
    path('', views.index, name='index'),
    path('jobs', views.create_jobs, name='create_jobs'),
    path('jobs/table', views.job_table, name='job_table'),
    path('jobs/<uuid:job_id>', views.job_row, name='job_row'),
    path('jobs/<uuid:job_id>/retry', views.retry_job, name='retry_job'),
    path('jobs/<uuid:job_id>/cancel', views.cancel_job, name='cancel_job'),
]
