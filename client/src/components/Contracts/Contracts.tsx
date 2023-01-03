import { useEffect, useMemo, useState } from "react";
import { useProfilesContext } from "../Profile";

interface Contract {
    id: number,
    terms: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    ContractorId: number;
    ClientId: number;
}

const fetchContracts = async (profileId: number) => {
    const contracts = await fetch('/contracts', {
        headers: { profile_id: `${profileId}` }
    });
    return await contracts.json();
}

const Contracts = () => {
    const profileData = useProfilesContext();
    const [contracts, setContracts] = useState<Contract[]>([]);

    const contractsInfo = useMemo(() => {
        if (!profileData) return [];
        return contracts.map(contract => ({
            id: contract.id,
            terms: contract.terms,
            createdAt: new Date(contract.createdAt).toLocaleString(),
            updatedAt: new Date(contract.updatedAt).toLocaleString(),
            contractor: profileData.profiles.find(profile => profile.id === contract.ContractorId)?.fullName,
            client: profileData.profiles.find(profile => profile.id === contract.ClientId)?.fullName,
        }));
    }, [contracts, profileData])

    useEffect(() => {
        if (!profileData) return;
        fetchContracts(profileData.currentProfile.id).then(newContracts => setContracts(newContracts))
    }, [profileData]);

    const showContractsTable = () => contractsInfo.length > 0 ? (
        <table className="table">
            <thead>
                <tr>
                    <th>Id</th>
                    <th>Terms</th>
                    <th> Created At</th>
                    <th> Updated At</th>
                    <th> Contractor </th>
                    <th> Client </th>
                </tr>
            </thead>
            <tbody>
                {
                    contractsInfo.map(({ id, terms, createdAt, updatedAt, contractor, client }) => (
                        <tr key={id}>
                            <td>{id}</td>
                            <td>{terms}</td>
                            <td>{createdAt}</td>
                            <td>{updatedAt}</td>
                            <td>{contractor}</td>
                            <td>{client}</td>
                        </tr>
                    ))
                }
            </tbody>
        </table>
    ) : <p>There are no in progress contracts to show</p>

    return (
        <nav className="panel">
            <p className="panel-heading">
                In progress contracts
            </p>
            <div className="panel-block is-active">
                {showContractsTable()}
            </div>
        </nav>
    );
}

export default Contracts;