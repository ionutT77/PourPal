from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def test_api(request):
    """Simple test endpoint to check if API is working"""
    return JsonResponse({
        'status': 'ok',
        'message': 'API is working!',
        'user_authenticated': request.user.is_authenticated,
        'user': str(request.user) if request.user.is_authenticated else 'Anonymous',
        'method': request.method,
        'csrf_exempt': True
    })
