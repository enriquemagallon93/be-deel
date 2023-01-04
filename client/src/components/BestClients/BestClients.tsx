import { ChangeEvent, useEffect, useState } from "react";
import { useProfilesContext } from "../Profile";
import DateTimePicker from 'react-datetime-picker';

interface Client {
    id: number;
    fullName: string;
    paid: number | null;
}  

const fetchBestClients = async (startDate?: Date, endDate?: Date, limit?: number) => {
    const dateRange = [
        ...(startDate ? ['start=' + encodeURIComponent(startDate.toISOString())] : []),
        ...(endDate ? ['end=' + encodeURIComponent(endDate.toISOString())] : []),
        ...(limit ? [`limit=${limit}`] : [])
    ].join('&');
    const clients = await fetch(`/admin/best-clients${dateRange ? `?${dateRange}` : ''}`);
    return await clients.json();
}

const BestClients = () => {
    const [limit, setLimit] = useState<number>();
    const profileData = useProfilesContext();
    const [clients, setClients] = useState<Client[]>([]);
    const [startDate, updateStartDate] = useState<Date>();
    const [endDate, updateEndDate] = useState<Date>();

    const handleLimitChange = ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
        const newLimit = Math.abs(Math.floor(Number.parseFloat(value)));
        setLimit(newLimit);
    }

    useEffect(() => {
        fetchBestClients(startDate, endDate, limit).then(newClients => setClients(newClients))
    }, [profileData, startDate, endDate, limit]);

    const showClientsTable = () => clients.length > 0 ? (
        <table className="table">
            <thead>
                <tr>
                    <th>Client</th>
                    <th>Total amount paid</th>
                </tr>
            </thead>
            <tbody>
                {
                    clients.map(({ id, fullName, paid }) => (
                        <tr key={id}>
                            <td>{fullName}</td>
                            <td>${paid || 0}</td>
                        </tr>
                    ))
                }
            </tbody>
        </table>
    ) : <p>There are no clients to show</p>

    return (
        <nav className="panel">
            <p className="panel-heading">
                Best Clients
            </p>
            <div className="panel-block is-active">
                <div className="container is-fluid">
                    <br />
                    <div className="columns is-flex is-flex-wrap-wrap">
                        <div className="is-half is-flex-shrink-0 is-flex-grow-0 mr-5">
                            Start date: <DateTimePicker onChange={updateStartDate} value={startDate} />
                        </div>
                        <div className="is-half is-flex-shrink-0 is-flex-grow-0">
                            End date: <DateTimePicker onChange={updateEndDate} value={endDate} />
                        </div>
                        <div style={{ flexBasis: '100%'}} className="is-full is-flex-shrink-0 is-flex-grow-1">
                            <label htmlFor="limit">Max results to show:</label> <input id="limit" type="number" onChange={handleLimitChange} min={1} step={1} pattern="^\d+$" className="input" value={limit} />
                        </div>
                    </div>
                    {showClientsTable()}
                </div>
            </div>
        </nav>
    );
}

export default BestClients;