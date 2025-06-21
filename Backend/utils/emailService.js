import nodemailer from 'nodemailer';

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

// Send appointment confirmation
export const sendAppointmentConfirmation = async (userEmail, appointment) => {
  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: userEmail,
    subject: 'Appointment Confirmation',
    html: `
      <h2>Your Appointment has been confirmed</h2>
      <p>Date: ${new Date(appointment.date).toLocaleDateString()}</p>
      <p>Time: ${appointment.timeSlot}</p>
      <p>Status: ${appointment.status}</p>
      ${appointment.notes ? `<p>Notes: ${appointment.notes}</p>` : ''}
    `
  };

  await transporter.sendMail(message);
};

// Send appointment confirmation email (function name expected by appointmentController.js)
export const sendAppointmentConfirmationEmail = async (patient, physiotherapist, appointment) => {
  // Send email to patient
  const patientMessage = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: patient.email,
    subject: 'Appointment Confirmation',
    html: `
      <h2>Your Appointment has been confirmed</h2>
      <p>Date: ${new Date(appointment.date).toLocaleDateString()}</p>
      <p>Time: ${appointment.time}</p>
      <p>Type: ${appointment.type}</p>
      <p>Physiotherapist: ${physiotherapist.name}</p>
      ${appointment.notes ? `<p>Notes: ${appointment.notes}</p>` : ''}
    `
  };

  await transporter.sendMail(patientMessage);
  
  // Send notification to physiotherapist
  const physiotherapistMessage = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: physiotherapist.email,
    subject: 'New Appointment Scheduled',
    html: `
      <h2>A new appointment has been scheduled</h2>
      <p>Patient: ${patient.name}</p>
      <p>Date: ${new Date(appointment.date).toLocaleDateString()}</p>
      <p>Time: ${appointment.time}</p>
      <p>Type: ${appointment.type}</p>
      ${appointment.notes ? `<p>Notes: ${appointment.notes}</p>` : ''}
    `
  };

  await transporter.sendMail(physiotherapistMessage);
};

// Send appointment status update
export const sendAppointmentUpdate = async (userEmail, appointment) => {
  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: userEmail,
    subject: 'Appointment Status Update',
    html: `
      <h2>Your Appointment Status has been updated</h2>
      <p>Date: ${new Date(appointment.date).toLocaleDateString()}</p>
      <p>Time: ${appointment.timeSlot}</p>
      <p>New Status: ${appointment.status}</p>
      ${appointment.notes ? `<p>Notes: ${appointment.notes}</p>` : ''}
    `
  };

  await transporter.sendMail(message);
};

// Send appointment status update email (function name expected by appointmentController.js)
export const sendAppointmentStatusUpdateEmail = async (recipient, sender, appointment) => {
  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: recipient.email,
    subject: 'Appointment Status Update',
    html: `
      <h2>Your Appointment Status has been updated</h2>
      <p>Date: ${new Date(appointment.date).toLocaleDateString()}</p>
      <p>Time: ${appointment.time}</p>
      <p>New Status: ${appointment.status}</p>
      ${appointment.cancellationReason ? `<p>Cancellation Reason: ${appointment.cancellationReason}</p>` : ''}
      ${appointment.notes ? `<p>Notes: ${appointment.notes}</p>` : ''}
      <p>Updated by: ${sender.name}</p>
    `
  };

  await transporter.sendMail(message);
};

// Send new treatment plan notification
export const sendNewTreatmentPlan = async (userEmail, treatmentPlan) => {
  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: userEmail,
    subject: 'New Treatment Plan Assigned',
    html: `
      <h2>A new treatment plan has been assigned to you</h2>
      <p>Title: ${treatmentPlan.title}</p>
      <p>Description: ${treatmentPlan.description}</p>
      <p>Start Date: ${new Date(treatmentPlan.startDate).toLocaleDateString()}</p>
      <p>End Date: ${new Date(treatmentPlan.endDate).toLocaleDateString()}</p>
      <h3>Goals:</h3>
      <ul>
        ${treatmentPlan.goals.map(goal => `<li>${goal}</li>`).join('')}
      </ul>
    `
  };

  await transporter.sendMail(message);
};

// Send new treatment plan email (function name expected by treatmentPlanController.js)
export const sendNewTreatmentPlanEmail = async (patient, physiotherapist, treatmentPlan) => {
  // Send email to patient
  const patientMessage = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: patient.email,
    subject: 'New Treatment Plan Assigned',
    html: `
      <h2>A new treatment plan has been assigned to you</h2>
      <p>Title: ${treatmentPlan.title}</p>
      <p>Description: ${treatmentPlan.description}</p>
      <p>Physiotherapist: ${physiotherapist.name}</p>
      <h3>Goals:</h3>
      <ul>
        ${treatmentPlan.goals.map(goal => `<li>${goal}</li>`).join('')}
      </ul>
      <p>Please log in to your account to view the complete treatment plan and exercises.</p>
    `
  };

  await transporter.sendMail(patientMessage);
};

// Send daily exercise reminder
export const sendExerciseReminder = async (userEmail, treatmentPlan) => {
  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: userEmail,
    subject: 'Daily Exercise Reminder',
    html: `
      <h2>Time for your daily exercises!</h2>
      <p>Treatment Plan: ${treatmentPlan.title}</p>
      <h3>Today's Exercises:</h3>
      <ul>
        ${treatmentPlan.exercises.map(ex => `
          <li>
            ${ex.exercise.name} - ${ex.sets} sets of ${ex.reps} reps
            ${ex.notes ? `<br>Notes: ${ex.notes}` : ''}
          </li>
        `).join('')}
      </ul>
      <p>Remember to log your progress after completing your exercises!</p>
    `
  };

  await transporter.sendMail(message);
};

// Send progress report
export const sendProgressReport = async (userEmail, progressData) => {
  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: userEmail,
    subject: 'Weekly Progress Report',
    html: `
      <h2>Your Weekly Progress Report</h2>
      <p>Week: ${new Date(progressData.startDate).toLocaleDateString()} - ${new Date(progressData.endDate).toLocaleDateString()}</p>
      <h3>Summary:</h3>
      <ul>
        <li>Exercise Sessions Completed: ${progressData.sessionsCompleted}</li>
        <li>Average Pain Level: ${progressData.averagePainLevel}</li>
        <li>Most Common Mood: ${progressData.commonMood}</li>
      </ul>
      <p>Keep up the good work! Regular exercise and tracking helps improve your recovery.</p>
    `
  };

  await transporter.sendMail(message);
};

// Send progress report email (function name expected by progressController.js)
export const sendProgressReportEmail = async (physiotherapist, patient, progress) => {
  // Send email to physiotherapist
  const physiotherapistMessage = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: physiotherapist.email,
    subject: `Progress Report for ${patient.name}`,
    html: `
      <h2>Progress Report for ${patient.name}</h2>
      <p>Date: ${new Date(progress.createdAt).toLocaleDateString()}</p>
      <p>Pain Level: ${progress.painLevel}</p>
      <p>Mobility: ${progress.mobility}</p>
      <p>Strength: ${progress.strength}</p>
      <p>Notes: ${progress.notes}</p>
      ${progress.mediaUrl ? `<p>Media: <a href="${progress.mediaUrl}">${progress.mediaUrl}</a></p>` : ''}
      <p>Please log in to your account to view the complete progress details.</p>
    `
  };

  await transporter.sendMail(physiotherapistMessage);
};