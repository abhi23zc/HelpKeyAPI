const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Step 1: Set up the email service (e.g., Gmail)
const transporter = nodemailer.createTransport({
    service: 'gmail', // For Gmail, you can also use other services like SMTP.
    auth: {
        user: 'Organikkanpur@gmail.com', // Your email address
        pass: 'rrjvjwgwotnbunox'   // Your email password (App password if using Gmail)
    }
});

// Step 2: Read the HTML template
const templatePath = path.join(__dirname, 'template.html');
let htmlTemplate = fs.readFileSync(templatePath, 'utf-8');

// Step 3: Replace placeholders (e.g., {{name}})
const recipientName = 'Harshit'; // Replace with recipient's actual name
htmlTemplate = htmlTemplate.replace('{{name}}', recipientName);

// Step 4: Set up the mail options (including HTML content)
const mailOptions = {
    from: 'Organikkanpur@gmail.com',    // Sender's email address
    to: 'kushwahaakash2000@gmail.com',     // Recipient's email address
    subject: 'Welcome to Our Service',  // Email subject
    html: htmlTemplate               // Email body (HTML content)
};

// Step 5: Send the email
transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        console.log('Error sending email:', error);
    } else {
        console.log('Email sent successfully:', info.response);
    }
});
