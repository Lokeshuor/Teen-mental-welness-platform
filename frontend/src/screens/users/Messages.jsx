import React from 'react';
import MessageCenter from '../../components/MessageCenter';

const Messages = () => (
    <MessageCenter
        basePath="/student/messages"
        contactsLabel="Therapists"
        emptyHint="Open a therapist's profile from Find a Therapist and choose Message to start one."
    />
);

export default Messages;
