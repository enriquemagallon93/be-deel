import { useEffect, useMemo, useRef, useState } from "react";
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

const fetchContractById = async (contractId: string, profileId: number) => {
    const contract = await fetch(`/contracts/${contractId}`, {
        headers: { profile_id: `${profileId}` }
    });
    if (contract.status === 200) {
        return {
            status: 200,
            contract: (await contract.json()) as Contract,
        }
    }
    return {
        status: contract.status,
    }
}

const ContractById = () => {
    const input = useRef<HTMLInputElement>(null);
    const profileData = useProfilesContext();
    const [contract, setContract] = useState<Contract | undefined>(undefined);
    const [contractId, setContractId] = useState('');

    const contractor = useMemo(() => {
        if (!profileData || !contract) return undefined;
        return profileData.profiles.find(profile => profile.id === contract.ContractorId)
    }, [profileData, contract])

    const client = useMemo(() => {
        if (!profileData || !contract) return undefined;
        return profileData.profiles.find(profile => profile.id === contract.ClientId)
    }, [profileData, contract]);

    useEffect(() => {
        if (!profileData) return;
        if (!contractId) {
            setContract(undefined);
            return;
        }
        fetchContractById(contractId, profileData.currentProfile.id).then(({ contract }) => setContract(contract))
    }, [profileData, contractId]);

    const searchContract = () => {
        if (!input.current) return;
        const { value: contractId } = input.current;
        setContractId(contractId);
    }

    const showContractsTable = () => contract ? (
        <table className="table">
            <thead>
                <tr>
                    <th>Status</th>
                    <th>Terms</th>
                    <th> Created At</th>
                    <th> Updated At</th>
                    <th> Contractor </th>
                    <th> Client </th>
                </tr>
            </thead>
            <tbody>
                {

                    <tr>
                        <td>{contract.status}</td>
                        <td>{contract.terms}</td>
                        <td>{contract.createdAt}</td>
                        <td>{contract.updatedAt}</td>
                        <td>{contractor?.fullName}</td>
                        <td>{client?.fullName}</td>
                    </tr>
                }
            </tbody>
        </table>
    ) : <p>There are no contracts with this id that belong to this user</p>

    return (
        <nav className="panel">
            <p className="panel-heading">
                Contract Info By Id
            </p>
            <div className="panel-block is-active">
                <div className="container is-fluid">
                    <br />
                    <div className="columns is-flex is-flex-wrap-wrap">
                        <input ref={input} className="input is-half is-flex-shrink-0 is-flex-grow-0" defaultValue={contractId} />
                        <button className="button is-one-third is-flex-shrink-0 is-flex-grow-0" onClick={searchContract}>Search contract</button>
                    </div>
                    {showContractsTable()}
                </div>
            </div>
        </nav>
    );
}

export default ContractById;