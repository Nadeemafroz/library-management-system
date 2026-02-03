import { useState } from 'react';
import MessageModel from '../../../models/MessageModel';

export const PostNewMessage = () => {
    const token = localStorage.getItem('token');

    const [title, setTitle] = useState('');
    const [question, setQuestion] = useState('');
    const [displayWarning, setDisplayWarning] = useState(false);
    const [displaySuccess, setDisplaySuccess] = useState(false);

    async function submitNewQuestion() {
        const url = `https://api.nadeem.sbs/api/messages/secure/add/message`;

        if (token && title.trim() !== '' && question.trim() !== '') {
            const messageRequestModel = new MessageModel(title, question);
            const requestOptions = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(messageRequestModel)
            };

            try {
                const response = await fetch(url, requestOptions);
                if (!response.ok) {
                    throw new Error('Something went wrong!');
                }

                setTitle('');
                setQuestion('');
                setDisplayWarning(false);
                setDisplaySuccess(true);
            } catch (error) {
                console.error('Error submitting question:', error);
                setDisplayWarning(true);
                setDisplaySuccess(false);
            }
        } else {
            setDisplayWarning(true);
            setDisplaySuccess(false);
        }
    }

    return (
        <div className='card mt-3'>
            <div className='card-header'>
                Ask a Question to Luv 2 Read Admin
            </div>
            <div className='card-body'>
                <form method='POST'>
                    {displayWarning && (
                        <div className='alert alert-danger' role='alert'>
                            {title.trim() === '' || question.trim() === ''
                                ? 'All fields must be filled out'
                                : 'Failed to submit question'}
                        </div>
                    )}
                    {displaySuccess && (
                        <div className='alert alert-success' role='alert'>
                            Question added successfully
                        </div>
                    )}
                    <div className='mb-3'>
                        <label className='form-label'>Title</label>
                        <input
                            type='text'
                            className='form-control'
                            placeholder='Title'
                            onChange={e => setTitle(e.target.value)}
                            value={title}
                        />
                    </div>

                    <div className='mb-3'>
                        <label className='form-label'>Question</label>
                        <textarea
                            className='form-control'
                            rows={3}
                            onChange={e => setQuestion(e.target.value)}
                            value={question}
                        />
                    </div>

                    <div>
                        <button
                            type='button'
                            className='btn btn-primary mt-3'
                            onClick={submitNewQuestion}
                        >
                            Submit Question
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
