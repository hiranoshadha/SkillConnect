# API Endpoints


## AdminMessageController

**GET** `/api/admin-messages/{id}`  
`ResponseEntity<AdminMessage> getMessageById(@PathVariable int id)`

**GET** `/api/admin-messages/admin/{adminId}`  
`ResponseEntity<List<AdminMessage>> getMessagesByAdminId(@PathVariable int adminId)`

**DELETE** `/api/admin-messages/{id}`  
`ResponseEntity<Void> deleteMessage(@PathVariable int id)`


## CommentController

**GET** `/api/comments/{id}`  
`ResponseEntity<Comment> getCommentById(@PathVariable int id)`

**GET** `/api/comments/post/{postId}`  
`ResponseEntity<List<Comment>> getCommentsByPostId(@PathVariable int postId)`

**GET** `/api/comments/user/{userId}`  
`ResponseEntity<List<Comment>> getCommentsByUserId(@PathVariable int userId)`

**DELETE** `/api/comments/{id}`  
`ResponseEntity<Void> deleteComment(@PathVariable int id)`


## FollowController

**GET** `/api/follow/{userId}/followers/count`  
`ResponseEntity<Integer> getFollowerCount(@PathVariable int userId)`

**GET** `/api/follow/{userId}/following/count`  
`ResponseEntity<Integer> getFollowingCount(@PathVariable int userId)`


## LearningPlanController

**GET** `/api/learning-plans/{id}`  
`ResponseEntity<LearningPlanDTO> getLearningPlanById(@PathVariable int id)`

**GET** `/api/learning-plans/user/{userId}`  
`ResponseEntity<List<LearningPlanDTO>> getLearningPlansByUserId(@PathVariable int userId)`

**DELETE** `/api/learning-plans/{id}`  
`ResponseEntity<Void> deleteLearningPlan(@PathVariable int id)`

**POST** `/api/learning-plans/{planId}/items`  
`ResponseEntity<LearningPlanItem> addItemToPlan(
            @RequestBody LearningPlanItem item,
            @PathVariable int planId)`

**DELETE** `/api/learning-plans/items/{itemId}`  
`ResponseEntity<Void> removeItemFromPlan(@PathVariable int itemId)`


## LearningPlanItemController

**GET** `/api/learning-plan-items/{id}`  
`ResponseEntity<LearningPlanItem> getItemById(@PathVariable int id)`

**GET** `/api/learning-plan-items/plan/{planId}`  
`ResponseEntity<List<LearningPlanItem>> getItemsByPlanId(@PathVariable int planId)`

**PUT** `/api/learning-plan-items/{id}/complete`  
`ResponseEntity<LearningPlanItem> markAsCompleted(@PathVariable int id)`

**DELETE** `/api/learning-plan-items/{id}`  
`ResponseEntity<Void> deleteItem(@PathVariable int id)`


## LikeController

**POST** `/api/likes/{postId}/user/{userId}`  
`ResponseEntity<Like> likePost(@PathVariable int postId, @PathVariable int userId)`

**DELETE** `/api/likes/{postId}/user/{userId}`  
`ResponseEntity<Void> unlikePost(@PathVariable int postId, @PathVariable int userId)`

**GET** `/api/likes/{postId}`  
`ResponseEntity<List<Like>> getLikesByPostId(@PathVariable int postId)`


## PostController

**GET** `/api/posts/{postId}`  
`ResponseEntity<Post> getPostById(@PathVariable int postId)`

**GET** `/api/posts/user/{userId}`  
`ResponseEntity<List<Post>> getPostsByUserId(@PathVariable int userId)`

**PUT** `/api/posts/{postId}`  
`ResponseEntity<Post> updatePost(@RequestBody Post post)`

**DELETE** `/api/posts/{postId}`  
`ResponseEntity<Void> deletePost(@PathVariable int postId)`


## UserController

**GET** `/api/users/{id}`  
`ResponseEntity<User> getUserById(@PathVariable int id)`

**GET** `/api/users/email/{email}`  
`ResponseEntity<User> getUserByEmail(@PathVariable String email)`

**DELETE** `/api/users/{id}`  
`ResponseEntity<Void> deleteUser(@PathVariable int id)`

**GET** `/api/users/exists/email/{email}`  
`ResponseEntity<Boolean> checkEmailExists(@PathVariable String email)`

**GET** `/api/users/exists/username/{username}`  
`ResponseEntity<Boolean> checkUsernameExists(@PathVariable String username)`

**PUT** `/api/users/{id}/update`  
`ResponseEntity<User> updateUser(
            @PathVariable int id,
            @RequestBody User user)`

**PUT** `/api/users/{id}/change-password`  
`ResponseEntity<Boolean> changePassword(
            @PathVariable int id,
            @RequestParam String currentPassword,
            @RequestParam String newPassword)`
