import { useEffect, useMemo, useState } from "react";
import { useProfilesContext } from "../Profile";
import DateTimePicker from 'react-datetime-picker';

interface Profession {
    profession: string;
    total_amount: number | null;
}  

const fetchBestProfessions = async (startDate?: Date, endDate?: Date) => {
    const dateRange = [
        ...(startDate ? ['start=' + encodeURIComponent(startDate.toISOString())] : []),
        ...(endDate ? ['end=' + encodeURIComponent(endDate.toISOString())] : [])
    ].join('&');
    const professions = await fetch(`/admin/best-profession${dateRange ? `?${dateRange}` : ''}`);
    return await professions.json();
}

const BestProfessions = () => {
    const profileData = useProfilesContext();
    const [professions, setProfessions] = useState<Profession[]>([]);
    const [startDate, updateStartDate] = useState<Date>();
    const [endDate, updateEndDate] = useState<Date>();

    useEffect(() => {
        fetchBestProfessions(startDate, endDate).then(newProfessions => setProfessions(newProfessions))
    }, [profileData, startDate, endDate]);

    const showProfessionsTable = () => professions.length > 0 ? (
        <table className="table">
            <thead>
                <tr>
                    <th>Profession</th>
                    <th>Total amount earned</th>
                </tr>
            </thead>
            <tbody>
                {
                    professions.map(({ profession, total_amount }) => (
                        <tr key={profession}>
                            <td>{profession}</td>
                            <td>${total_amount || 0}</td>
                        </tr>
                    ))
                }
            </tbody>
        </table>
    ) : <p>There are no professions to show</p>

    return (
        <nav className="panel">
            <p className="panel-heading">
                Best Professions
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
                    </div>
                    {showProfessionsTable()}
                </div>
            </div>
        </nav>
    );
}

export default BestProfessions;