import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';
import { Student } from '../types';

// Structure for sending email notification
interface EmailNotification {
  to: string;
  subject: string;
  text: string;
  html: string;
}

// Function to send class reminder email
export const sendClassReminderEmail = async (student: Student): Promise<void> => {
  try {
    const sendEmail = httpsCallable(functions, 'sendEmail');
    
    const emailData: EmailNotification = {
      to: student.notificationEmail,
      subject: 'Reminder: Only 1 Badminton Class Remaining',
      text: `Hello ${student.name},\n\nThis is a friendly reminder that you have only 1 badminton class remaining. Please consider purchasing more classes to continue your training.\n\nThank you,\nYour Badminton Coach`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2>Class Reminder</h2>
          <p>Hello ${student.name},</p>
          <p>This is a friendly reminder that you have <strong>only 1 badminton class remaining</strong>.</p>
          <p>Please consider purchasing more classes to continue your training without interruption.</p>
          <div style="margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
            <p style="margin: 0; font-weight: bold;">Next Steps:</p>
            <p style="margin: 10px 0 0;">Please contact your coach to purchase additional classes.</p>
          </div>
          <p>Thank you,<br>Your Badminton Coach</p>
        </div>
      `
    };
    
    await sendEmail(emailData);
    console.log(`Reminder email sent to ${student.name} at ${student.notificationEmail}`);
  } catch (error) {
    console.error('Error sending reminder email:', error);
    throw error;
  }
};

// This function checks if a reminder should be sent and sends it if needed
export const checkAndSendReminderIfNeeded = async (
  studentId: string, 
  remainingClassesBefore: number, 
  remainingClassesAfter: number
): Promise<void> => {
  // Only send a reminder if going from 2 classes to 1 class
  if (remainingClassesBefore === 2 && remainingClassesAfter === 1) {
    const student = await import('./studentService').then(module => 
      module.getStudent(studentId)
    );
    
    if (student) {
      await sendClassReminderEmail(student);
    }
  }
}; 