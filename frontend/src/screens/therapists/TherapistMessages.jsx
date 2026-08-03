import React from 'react';
import MessageCenter from '../../components/MessageCenter';

const TherapistMessages = () => (
    <MessageCenter
        basePath="/therapist/messages"
        contactsLabel="Students"
        emptyHint="Pick a student from My Students and choose Message to start one."
    />
);

export default TherapistMessages;
