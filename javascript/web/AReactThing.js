import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import DatePicker from 'react-date-picker';

function App() {
    const [value, onChange] = useState(new Date());

    return (
        <div>
            <DatePicker onChange={onChange} value={value} />
            <div>You chose: <b>{value && value.toISOString()}</b></div>
        </div>
    );
}

document.addEventListener('DOMContentLoaded', function () {
    const wrapper = document.querySelector('#react-thing-wrapper');
    const root = ReactDOM.createRoot(wrapper);
    root.render(<App />);
});
