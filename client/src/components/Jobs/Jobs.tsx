import { useEffect, useMemo, useState } from "react";
import { useProfilesContext } from "../Profile";

interface Job {
    id: number;
    description: string;
    price: number;
    paid: boolean;
    paymentDate: string;
    createdAt: string;
    updatedAt: string;
    ContractId: number;
}

const fetchUnpaidJobs = async (profileId: number) => {
    const unpaidJobs = await fetch('/jobs/unpaid', {
        headers: { profile_id: `${profileId}` }
    });
    return await unpaidJobs.json();
}

const Jobs = () => {
    const profileData = useProfilesContext();
    const [unpaidJobs, setUnpaidJobs] = useState<Job[]>([]);
    const [error, setError] = useState('');
    const [statusCode, setStatusCode] = useState(0);

    const unpaidJobsInfo = useMemo(() => {
        if (!profileData) return [];
        return unpaidJobs.map(job => ({
            id: job.id,
            description: job.description,
            createdAt: new Date(job.createdAt).toLocaleString(),
            updatedAt: new Date(job.updatedAt).toLocaleString(),
            price: job.price,
            paid: job.paid,
            paymentDate: new Date(job.paymentDate).toLocaleString(),
            ContractId: job.ContractId,
        }));
    }, [unpaidJobs, profileData])

    const payJob = async (jobId: number) => {
        const payment = await fetch(`/jobs/${jobId}/pay`, {
            method: 'post',
            headers: { profile_id: `${profileData?.currentProfile.id}` }
        });

        if (payment.status!==200) {
            setError(await payment.text());
            setStatusCode(payment.status);
            return;
        }
        if(!profileData) return;
        profileData.refetch(profileData.currentProfile.id);
    }

    useEffect(() => {
        setError('');
        if (!profileData) return;
        fetchUnpaidJobs(profileData.currentProfile.id).then(newUnpaidJobs => setUnpaidJobs(newUnpaidJobs))
    }, [profileData]);

    const showJobsTable = () => unpaidJobsInfo.length > 0 ? (
        <table className="table">
            <thead>
                <tr>
                    <th>Id</th>
                    <th> Description</th>
                    <th> Price </th>
                    <th> Contract Id</th>
                    {profileData?.currentProfile.type === 'client' ? <th>Actions</th> : <></>}
                </tr>
            </thead>
            <tbody>
                {
                    unpaidJobsInfo.map(({ id, description, price, ContractId }) => (
                        <tr key={id}>
                            <td>{id}</td>
                            <td>{description}</td>
                            <td>${price}</td>
                            <td>{ContractId}</td>
                            {profileData?.currentProfile.type === 'client' ? <td><button className="button" onClick={() => {payJob(id)}}>Pay</button></td> : <></>}
                        </tr>
                    ))
                }
            </tbody>
        </table>
    ) : <p>There are no unpaid jobs to show</p>

    return (
        <>
            <nav className="panel">
                <p className="panel-heading">
                    In progress jobs
                </p>
                <div className="panel-block is-active">
                    {showJobsTable()}
                </div>
            </nav>
            {error ? <article className="message is-danger">
                <div className="message-header">
                    <p>Error {statusCode}</p>
                    <button className="delete" onClick={() => { setError(''); }} aria-label="delete"></button>
                </div>
                <div className="message-body">
                    {error}
                </div>
            </article> : <></>}
        </>
    );
}

export default Jobs;