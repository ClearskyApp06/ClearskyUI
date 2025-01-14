export default function AccountLabels({account}){
    if(!account|| !account.labels){
        return null;
    }

    return (
        <div className="account-labels">
            {account.labels.map((label) => (
                <span key={label.uri} className="account-label">
                    {label}
                </span>
            ))}
        </div>
    );
}
