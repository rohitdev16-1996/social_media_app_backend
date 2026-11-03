# Social Media App API List:

| Group              | Method | Route                               | Purpose                                                 |
| ------------------ | ------ | ----------------------------------- | ------------------------------------------------------- |
| Auth               | POST   | /signup                             | Create Account                                          |
|                    | POST   | /login                              | Login                                                   |
|                    | POST   | /logout                             | Logout                                                  |
|                    |        |                                     |                                                         |
| Profile            | GET    | /profile/view                       | View own Profile                                        |
|                    | PATCH  | /profile/edit                       | Edit profile fields (age, gender, photo, skills, about) |
|                    | PATCH  | /profile/password                   | Change/forgot password (separate API, different logic)  |
|                    |        |                                     |                                                         |
| Connection Request | POST   | /request/send/requested/:userId     | Requested                                               |
|                    | POST   | /request/send/ignored/:userId       | Ignored                                                 |
|                    | POST   | /request/review/accepted/:requestId | Accept a received request                               |
|                    | POST   | /request/review/rejected/:requestId | Reject a received request                               |
|                    |        |                                     |                                                         |
| User               | GET    | /user/connections                   | All my friends                                          |
|                    | GET    | /user/requests/received             | Requests people sent me                                 |
|                    | GET    | /user/feed                          | Profiles of other users to send the request             |
