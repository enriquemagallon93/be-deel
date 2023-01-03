import './styles.css'

const Hero = () => {
    const resetDatabase = async () => {
        await fetch('/admin/reset-db', {
            method: 'post',
        });
        window.location.reload();
    };

    return (
        <section className="hero has-text-left">
            <div className="hero-body">
                <p className="title">
                    Backend Test
                </p>
                <p className="subtitle">
                    Deel
                </p>
                <button className='button' onClick={resetDatabase}>Reset Database</button>
            </div>
        </section>
    )
};

export default Hero;