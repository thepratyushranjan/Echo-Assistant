from ast import Expression
from multiprocessing import context
from django.shortcuts import render
from rest_framework.generics import GenericAPIView, ListCreateAPIView, CreateAPIView
from rest_framework.response import Response
from accounts.models import OneTimePassword
from accounts.serializers import PasswordResetRequestSerializer,LogoutUserSerializer, UserRegisterSerializer, LoginSerializer, SetNewPasswordSerializer, MessageSerializer, ChatThreadSerializers
from rest_framework import status
from .utils import send_generated_otp_to_email
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import smart_str, DjangoUnicodeDecodeError
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from rest_framework.permissions import IsAuthenticated
from .models import User, ChatThread, Message
import openai
from django.conf import settings
# Create your views here.


class RegisterView(GenericAPIView):
    serializer_class = UserRegisterSerializer

    def post(self, request):
        user = request.data
        serializer=self.serializer_class(data=user)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            user_data=serializer.data
            send_generated_otp_to_email(user_data['email'], request)
            return Response({
                'data':user_data,
                'message':'thanks for signing up a passcode has be sent to verify your email'
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




class VerifyUserEmail(GenericAPIView):
    def post(self, request):
        try:
            passcode = request.data.get('otp')
            user_pass_obj=OneTimePassword.objects.get(otp=passcode)
            user=user_pass_obj.user
            if not user.is_verified:
                user.is_verified=True
                user.save()
                return Response({
                    'message':'account email verified successfully'
                }, status=status.HTTP_200_OK)
            return Response({'message':'passcode is invalid user is already verified'}, status=status.HTTP_204_NO_CONTENT)
        except OneTimePassword.DoesNotExist as identifier:
            return Response({'message':'passcode not provided'}, status=status.HTTP_400_BAD_REQUEST)
        

class LoginUserView(GenericAPIView):
    serializer_class=LoginSerializer
    def post(self, request):
        serializer= self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class PasswordResetRequestView(GenericAPIView):
    serializer_class=PasswordResetRequestSerializer

    def post(self, request):
        serializer=self.serializer_class(data=request.data, context={'request':request})
        serializer.is_valid(raise_exception=True)
        return Response({'message':'we have sent you a link to reset your password'}, status=status.HTTP_200_OK)
        # return Response({'message':'user with that email does not exist'}, status=status.HTTP_400_BAD_REQUEST)
    



class PasswordResetConfirm(GenericAPIView):

    def get(self, request, uidb64, token):
        try:
            user_id=smart_str(urlsafe_base64_decode(uidb64))
            user=User.objects.get(id=user_id)

            if not PasswordResetTokenGenerator().check_token(user, token):
                return Response({'message':'token is invalid or has expired'}, status=status.HTTP_401_UNAUTHORIZED)
            return Response({'success':True, 'message':'credentials is valid', 'uidb64':uidb64, 'token':token}, status=status.HTTP_200_OK)

        except DjangoUnicodeDecodeError as identifier:
            return Response({'message':'token is invalid or has expired'}, status=status.HTTP_401_UNAUTHORIZED)

class SetNewPasswordView(GenericAPIView):
    serializer_class=SetNewPasswordSerializer

    def patch(self, request):
        serializer=self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response({'success':True, 'message':"password reset is succesful"}, status=status.HTTP_200_OK)


class TestingAuthenticatedReq(GenericAPIView):
    permission_classes=[IsAuthenticated]

    def get(self, request):

        data={
            'msg':'its works'
        }
        return Response(data, status=status.HTTP_200_OK)

class LogoutApiView(GenericAPIView):
    serializer_class=LogoutUserSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer=self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(status=status.HTTP_204_NO_CONTENT)
 

class ChatThreadApiView(ListCreateAPIView):
    serializer_class=ChatThreadSerializers
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer=self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        thread = serializer.save()
        return Response(self.get_serializer(thread).data, status=status.HTTP_201_CREATED)
    
# class MessageApiView(CreateAPIView):
#     serializer_class=MessageSerializer
#     permission_classes = [IsAuthenticated]

#     def create(self, request, *args, **kwargs):
#         thread_id = request.data.get('thread_id')
#         user_message = request.data.get('prompt')
#         thread = ChatThread.objects.filter(id=thread_id).first() if thread_id else ChatThread.objects.create()

#         user_message_obj = Message.objects.create(
#             Chat_Thread = thread,
#             prompt = user_message
#         )

#         try:
#             response = openai.ChatCompletion.create(
#                 model = "gpt-3.5-turbo",
#                 messages = [{"role" : "user", "content": user_message }], temperature = 0.5 
#             )
#             assistant_response_text = response.choices[0].message.content
#             assistant_message_obj = Message.objects.create(
#                 Chat_Thread = thread, 
#                 prompt = user_message,
#                 response = assistant_response_text
#             )
#             serializer = MessageSerializer(instance = assistant_message_obj)
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         except openai.error.OpenAIError as e:
#             return response({"error" : str(e)}, status = status.HTTP_500_INTERNAL_SERVER_ERROR)
#         except Exception as e:
#             return response({"error" : str(e)}, status = status.HTTP_500_INTERNAL_SERVER_ERROR)



class MessageApiView(CreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        thread_id = request.data.get('thread_id')
        user_message = request.data.get('prompt')
        thread = ChatThread.objects.filter(id=thread_id).first() if thread_id else ChatThread.objects.create()

        user_message_obj = Message.objects.create(
            Chat_Thread=thread,
            prompt=user_message
        )

        try:
            openai.api_key = settings.OPENAI_API_KEY
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": user_message}],
                temperature=0.5
            )

            assistant_response_text = response.choices[0].message['content']
            assistant_message_obj = Message.objects.create(
                Chat_Thread=thread,
                prompt=user_message,
                response=assistant_response_text
            )

            serializer = MessageSerializer(instance=assistant_message_obj)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except openai.error.OpenAIError as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)