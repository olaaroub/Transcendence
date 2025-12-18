# ft_transcendence Task Board

## DevOps & Security (Me)

- [x] Fix ModSecurity config loading order (Solved).
- [x] Add "Double Extension" rule to WAF (Block `image.php.jpg`).
- [x] Update `scan_php.sh` to block non-image Magic Bytes (PDFs/EXEs).
- [ ] Set up Rate Limiting in Nginx/ModSec to stop spam uploads.
- [x] Ensure Prometheus & Grafana are scraping backend metrics.
- [ ] Add false positive rules for searchbar and password.(half done)
- [x] Microservices are done(logs and using createError() also the global err handling and bubbling is all set)
- [x] Added /metrics and counting logging attempts and all other events.... optimized the whole backend code

## Frontend (MMONDAD)

- [ ] **JWT Not Updated:** When I log out and get back, the containers are EXITED, I refresh the page I get the
      sign in form, I do sign in the backend generates a new token, but the jwt token is not updated in
      local storage, so even if i am logged in i cant upload any image because i need the up to date jwt token.
      ![screenshot_of_error](./images/screenshot_jwt_notUpdated_error.png)

- [ ] **Uploads:** Add `accept="image/png, image/jpeg"` to the file input HTML.
- [ ] **Error Handling:** Display generic error messages from backend (example: "Upload failed").
- [ ] **UX:** When I finish uploading an avatar, I should get out from the settings page.

## Backend (OHAMMOU-)

- [x] **Global Error Handler:** Stop returning 502s. Catch errors and return JSON `{ "message": "..." }
- [x] **Create a vertial tables using view:**
- [x] **Create indexes to facilitate the sort users based on scor**
- [x] **add  leader Bord route**
- [x] **Validation:** Use `file-type` library to check Magic Bytes before saving (Safety Net).
- [ ] **Logs:** Ensure errors are printed as JSON for the ELK stack.
- [x] **Use node modules:** Import instead of  require.
- [canceled] **learn gRPC:** to build mecro sirveces
- [ ] **send the email to the front:**
- [ ] **setup the app chat service**
- [ ] **create a chat databases:** cash database to store the user information and message database to store the last messages
- [ ] **open the sockets and start users commencation:** send messages with users
- [ ] **store the messages in database**
- [ ] **get the data from the user services and store it in the cash while send it to the front:**
- [ ] **get the data from users using amqp protocole and RabbitMQ brocker**
<!-- union intersect distinct  -->
## Known Bugs

- [ ]
