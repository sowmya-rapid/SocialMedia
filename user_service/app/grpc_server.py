import grpc
from concurrent import futures
from bson import ObjectId

from app.database import users_collection
from proto import user_pb2, user_pb2_grpc


class UserService(user_pb2_grpc.UserServiceServicer):

    def ValidateUser(self, request, context):
        try:
            user = users_collection.find_one(
                {"_id": ObjectId(request.user_id)}
            )
            return user_pb2.ValidateUserResponse(
                is_valid = user is not None
            )
        except Exception:
            return user_pb2.ValidateUserResponse(
                is_valid = False
            )


def serve():
    server = grpc.server(
        futures.ThreadPoolExecutor(max_workers=10)
    )

    user_pb2_grpc.add_UserServiceServicer_to_server(
        UserService(),
        server
    )

    server.add_insecure_port("[::]:50051")
    server.start()

    print("✅ User gRPC server running on port 50051")
    server.wait_for_termination()


if __name__ == "__main__":
    serve()
