# UniBoard demonstration guide

Target length: 4 minutes 40 seconds. The rubric allows a maximum of 5 minutes and requires the presenter's camera to be on. Use your own words and show the real running application.

Before recording, start MongoDB, the backend and the frontend. Provision an admin if needed. Have a student account ready in another tab. Prepare one small poster image and PDF, or use docs/sample-notice-poster.png and docs/sample-notice-document.pdf as labelled demonstration attachments. Keep notifications off, your camera visible and the relevant database collection ready to show.

| Time | What to show | Simple talking points |
|---|---|---|
| 0:00–0:25 | Student Login and the separate Administrator tab | Introduce yourself, your index and UniBoard. Explain that administrators publish campus announcements and students view relevant notices. Name Vue, Express, Node.js and MongoDB. |
| 0:25–1:20 | Admin Login → feed → Create announcement | Select a poster and PDF. Enter a title, content, category and audience, then publish. Explain that the new notice is saved in MongoDB. |
| 1:20–2:15 | Student Login → image feed | Show that the feed opens first. Search for the title, filter a category and change the sort order. Explain that a student sees university-wide notices and notices for their batch. |
| 2:15–3:05 | Open notice → attachments → interaction | Zoom the poster, briefly view the PDF, save the notice, comment and mark it as read. Explain that the PDF can also be downloaded. |
| 3:05–4:05 | Admin Panel | Edit the title or poster, save and show the updated result. Open Read Receipts. Demonstrate cancelling Delete, then confirm deletion of a spare demonstration notice. |
| 4:05–4:40 | MongoDB and a short code view | Show the actual Notice document/collection and explain that records remain after refreshing. Point to the model relationships and tests, then finish. |

Do not delete your only useful notice during the demonstration. Use a separate sample record for deletion. Do not show passwords, tokens or your .env file in the recording. After recording, verify that your camera was visible, the audio is clear and the duration is no more than 5 minutes.

Suggested filename: EG_2023_5753_UniBoard_Demo.mp4. Confirm your index number before submitting.
