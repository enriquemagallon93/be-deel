import './styles.css';
import { useProfilesContext } from '../Profile';
import { useEffect, useState } from 'react';

const UsersSelector = () => {
    const profileData = useProfilesContext();
    const [error, setError] = useState('');
    const [statusCode, setStatusCode] = useState(0);

    useEffect(() => {
        setError('');
    }, [profileData])

    if (profileData === null) return <></>

    const { currentProfile, profiles, setCurrentProfile, refetch } = profileData;

    const handleSelection: React.ChangeEventHandler<HTMLSelectElement> = ({ target: { value: newProfileId } }) => {
        setCurrentProfile(profiles.find(profile => profile.id === Number.parseInt(newProfileId)));
    }

    const depositMoney = async () => {
        const deposit = await fetch(`/balances/deposit/${currentProfile.id}`, {
            method: 'post',
            headers: { profile_id: `${currentProfile.id}` }
        });

        if (deposit.status!==200) {
            setError(await deposit.text());
            setStatusCode(deposit.status);
            return;
        }
        refetch(currentProfile.id);
    }

    return (
        <>
            <nav className="panel">
                <p className="panel-heading">
                    Current Profile
                </p>
                <div className="panel-block is-active">
                    <table className='table'>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Profession</th>
                                <th>Balance</th>
                                <th>Type</th>
                                {currentProfile.type === 'client' ? <th> Actions </th> : <></>}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <select className="users-selector" id="profile" onChange={handleSelection} value={currentProfile.id}>
                                        {profiles.map(({ id, fullName }) => (
                                            <option
                                                key={id}
                                                value={id}
                                                className="dropdown-item">
                                                {fullName}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td>{currentProfile.profession}</td>
                                <td>${currentProfile.balance}</td>
                                <td>{currentProfile.type}</td>
                                {currentProfile.type === 'client' ? <td><button className="button" onClick={depositMoney}>Deposit Money</button></td> : <></>}
                            </tr>
                        </tbody>
                    </table>
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
    )
};

export default UsersSelector;