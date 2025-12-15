import grpc
from proto import user_pb2, user_pb2_grpc

def validate_user(user_id: str) -> bool:
    channel = grpc.insecure_channel("localhost:50051")
    stub = user_pb2_grpc.UserServiceStub(channel)

    request = user_pb2.ValidateUserRequest(user_id=user_id)
    response = stub.ValidateUser(request)

    return response.is_valid
