import loadingsrc from '../assets/loading.gif';
import './Loading.scss';
function Loading() {
    return <div className='loading'>
        <img src={loadingsrc} alt="Loading..." className='loading__image' />
    </div>
}

export default Loading