import { useEffect, useState } from 'react';
import MessageModel from '../../../models/MessageModel';
import { SpinnerLoading } from '../../Utils/SpinnerLoading';
import { Pagination } from '../../Utils/Pagination';

export const Messages = () => {
    const token = localStorage.getItem('token');

    const [isLoadingMessages, setIsLoadingMessages] = useState(true);
    const [httpError, setHttpError] = useState<string | null>(null);

    const [messages, setMessages] = useState<MessageModel[]>([]);
    const [messagesPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(5);

    useEffect(() => {
        const fetchUserMessages = async () => {
            try {
                const url = `/api/messages/secure/user?page=${currentPage - 1}&size=${messagesPerPage}`;
                const requestOptions = {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                };

                const response = await fetch(url, requestOptions);
                if (!response.ok) {
                    throw new Error('Failed to fetch user messages');
                }

                const data = await response.json();
                setMessages(data.content);
               
                setTotalPages(data.totalPages);
            } catch (error: any) {
                setHttpError(error.message);
            } finally {
                setIsLoadingMessages(false);
            }
        };

        fetchUserMessages();
        window.scrollTo(0, 0);
    }, [currentPage]);

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    if (isLoadingMessages) return <SpinnerLoading />;
    if (httpError) {
        return (
            <div className="container m-5">
                <p>{httpError}</p>
            </div>
        );
    }

    return (
        <div className="mt-2">
            {messages.length > 0 ? (
                <>
                    <h5>Current Q/A:</h5>
                    {messages.map((message) => (
                        <div key={message.id}>
                            <div className="card mt-2 shadow p-3 bg-body rounded">
                                <h5>Case #{message.id}: {message.title}</h5>
                                <h6>{message.userEmail}</h6>
                                <p>{message.question}</p>
                                <hr />
                                <div>
                                    <h5>Response:</h5>
                                    {message.response && message.adminEmail ? (
                                        <>
                                            <h6>{message.adminEmail} (admin)</h6>
                                            <p>{message.response}</p>
                                        </>
                                    ) : (
                                        <p><i>Pending response from administration. Please be patient.</i></p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </>
            ) : (
                <h5>All questions you submit will be shown here</h5>
            )}
            {totalPages > 1 && (
                <Pagination 
                    currentPage={currentPage} 
                    totalPages={totalPages} 
                    paginate={paginate} 
                />
            )}
        </div>
    );
};
