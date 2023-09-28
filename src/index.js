import React, { useState, useEffect, createContext, useContext } from 'react';
import ReactDOM from 'react-dom/client';  // ReactDOM is a module that is part of React and is used to render React components to the DOM
import {pizzaData, mainDishData, appetizerData, dessertData} from './data.js'; // import the pizzaData array from the data.js file
import './index.css'; // import the index.css file
import Modal from 'react-modal'; // import the Modal component from the react-modal library

Modal.setAppElement('#root'); // set the root element for the Modal component
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({});

  const addToCart = (category, item) => {
    setCart((prevCart) => ({ ...prevCart, [category]: item }));
  };

  return (
    <CartContext.Provider value={{ cart, addToCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function MenuItem(props) {
  const soldOutClass = props.soldOut ? 'sold-out' : '';

  return (
    <li className={`menuItem ${soldOutClass}`} style={{animationDelay: `${props.delay}s`}}>
        <img src={props.photoName} alt={props.name}/>
        <div>
          <h3>{props.name}</h3>
          <p>{props.ingredients}</p>
          <span>{props.soldOut ? "Sold Out" : "$" + props.price}</span>
        </div> 
    </li>
  );
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function Header () {
    return (
        <header className='header'>
            <h1>Venezia Kitchen</h1>
            <h2>A fine dining experience, delivered fresh to your door</h2> 
        </header>
    )
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function Menu() {
  const [currentMenu, setCurrentMenu] = useState('appetizer');
  const [pizza, setPizza] = useState([]);
  const [mainDish, setMainDish] = useState([]);
  const [appetizer, setAppetizer] = useState([]);
  const [dessert, setDessert] = useState([]);

  useEffect(() => {
    setPizza(pizzaData);
    setMainDish(mainDishData);
    setAppetizer(appetizerData);
    setDessert(dessertData);
  }, []);

  function renderMenu() {
    switch (currentMenu) {
      case 'pizza':
        return (
          <ul className='food-list'>
            {pizza.map((item, index) => (
              <MenuItem key={item.name} {...item} delay={index * 0.3} />
            ))}
          </ul>
        );
      case 'mainDish':
        return (
          <ul className='food-list'>
            {mainDish.map((item, index) => (
              <MenuItem key={item.name} {...item} delay={index * 0.3} />
            ))}
          </ul>
        );
      case 'appetizer':
        return (
          <ul className='food-list'>
            {appetizer.map((item, index) => (
              <MenuItem key={item.name} {...item} delay={index * 0.3} />
            ))}
          </ul>
        );
      case 'dessert':
        return (
          <ul className='food-list'>
            {dessert.map((item, index) => (
              <MenuItem key={item.name} {...item} delay={index * 0.3} />
            ))}
          </ul>
        );
      default:
        return <p>No menu available</p>;
    }
  }

  function getMenuHeader() {
    switch (currentMenu) {
      case 'pizza':
        return 'Our perfectly crafter dough, fresh ingredients, and signature sauce make our pizza the best in town';
      case 'mainDish':
        return 'The chefs signature dishes are prepared with the finest ingredients and served with our homemade bread';
      case 'appetizer':
        return 'All our appetizers are made to perfectly pair with our our main dishes and pizza';
      case 'dessert':
        return 'Our deceadent desserts are the perfect way to end your meal';
      default:
        return 'Menu';
    }
  }

  return (
    <main className='menu'>
      <h2>Our Menu</h2>
      <h4>{getMenuHeader()}</h4>
        <header className='menu-buttons'>
          <button className='btn' onClick={() => setCurrentMenu('appetizer')}>Appetizers</button>
          <button className='btn' onClick={() => setCurrentMenu('pizza')}>Pizza</button>
          <button className='btn' onClick={() => setCurrentMenu('mainDish')}>Main Dishes</button>
          <button className='btn' onClick={() => setCurrentMenu('dessert')}>Desserts</button>
        </header>
      <ul className='food-list'>
        {renderMenu()}
      </ul>
    </main>
  );
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// create a timer element that updates every second to display the current time
function Timer () {
    const [time, setTime] = React.useState(new Date().toLocaleTimeString());
    React.useEffect(() => {
        const interval = setInterval(() => {
            setTime(new Date().toLocaleTimeString());
        }, 1000);
        return () => clearInterval(interval);
    }, []);
    return <span>{time}</span>
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function Footer({ notice, isOpen, openModal }) {
  return (
    <footer className='footer'>
      <div className='order'>
        <OrderBtn isOpen={isOpen} openModal={openModal} />
        <p><strong>{Timer()} | VENEZIA KITCHEN | {notice} </strong> </p>
      </div>
    </footer>
  );
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function App() {
  let currentHour = new Date().getHours();
  const closeHour = 21;
  const openHour = 11;
  let timeToClose = closeHour - currentHour;
    
  let notice = currentHour <= openHour || currentHour >= closeHour ? "We are currently closed" : `We are currently open for ${timeToClose} more hours`;

  const [modalIsOpen, setModalIsOpen] = useState(false);

  return (
    <CartProvider>
      <div>
        <Header />
        <Menu />
        <Footer notice={notice} isOpen={currentHour >= openHour && currentHour <= closeHour} openModal={() => setModalIsOpen(true)} />
        <OrderModal isOpen={modalIsOpen} closeModal={() => setModalIsOpen(false)} />
      </div>
    </CartProvider>
  );
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function OrderBtn({ isOpen, openModal }) {
  return (
    isOpen ? (
      <div>
        <button className='btn' onClick={openModal}>Order Now</button>
      </div>
    ) : null
  );
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function OrderModal({ isOpen, closeModal }) {
  const [step, setStep] = useState(1);
  // Replace the following line with actual hook or prop
  const { cart, addToCart } = useCart(); 

  const goToNextStep = () => setStep(step + 1);
  const goToPreviousStep = () => setStep(step - 1);

  const renderStepContent = () => {
    switch(step) {
      case 1:
        return <UserInfoForm addToCart={addToCart} goToNextStep={goToNextStep} />;
      case 2:
        return <AppetizerMenu addToCart={addToCart} goToNextStep={goToNextStep} goToPreviousStep={goToPreviousStep} />;
      case 3:
        return <MainDishMenu addToCart={addToCart} goToNextStep={goToNextStep} goToPreviousStep={goToPreviousStep} />;
      case 4:
        return <DessertMenu addToCart={addToCart} goToNextStep={goToNextStep} goToPreviousStep={goToPreviousStep} />;
      case 5:
        return <OrderConfirmation goToPreviousStep={goToPreviousStep} />;
      default:
        return <div>Invalid step</div>;
    }
  }

  return (
    <Modal
  isOpen={isOpen}
  onRequestClose={closeModal}
  contentLabel="Order Modal"
  style={{
    content: {
      position: 'relative', 
      height: '85%' 
    }
  }}
>
  <div className='modal-container'>
    <button className='close-btn' onClick={closeModal}>&times;</button>
    <div className='modal-content'>
      {renderStepContent()}
    </div>
  </div>
</Modal>
  );
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// set forms: user info, appetizer, main dish, dessert, order confirmation
function UserInfoForm({ addToCart, goToNextStep }) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState({name: false, address: false, phone: false});

  const handleSubmit = (event) => {
    event.preventDefault();

    // Reset errors
    setErrors({name: false, address: false, phone: false});

    // Validate inputs
    if (!name.trim()) {
      setErrors(errors => ({...errors, name: true}));
      return;
    }

    if (!address.trim()) {
      setErrors(errors => ({...errors, address: true}));
      return;
    }

    if (!phone.trim()) {
      setErrors(errors => ({...errors, phone: true}));
      return;
    }

    // Proceed if no errors
    addToCart('userInfo', { name, address, phone });
    goToNextStep();
  }

  return (
    <form className='form-container' onSubmit={handleSubmit}>
      <h2>Enter Delivery Information</h2>
      
      <label htmlFor='name'>Name</label>
      <input 
        id='name' 
        type='text' 
        value={name} 
        onChange={(event) => setName(event.target.value)}
        className={errors.name ? 'input-error' : ''}
      />
      {errors.name && <p className="error-message">Name is required</p>}

      <label htmlFor='address'>Address</label>
      <input 
        id='address' 
        type='text' 
        value={address} 
        onChange={(event) => setAddress(event.target.value)} 
        className={errors.address ? 'input-error' : ''}
      />
      {errors.address && <p className="error-message">Address is required</p>}

      <label htmlFor='phone'>Phone Number</label>
      <input 
        id='phone' 
        type='text' 
        value={phone} 
        onChange={(event) => setPhone(event.target.value)} 
        className={errors.phone ? 'input-error' : ''}
      />
      {errors.phone && <p className="error-message">Phone number is required</p>}

      <button className='btn' type='submit'>Next</button>
    </form>
  );
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function AppetizerMenu({ goToNextStep, goToPreviousStep }) {
  const [selectedAppetizer, setSelectedAppetizer] = useState(null);
  const { addToCart } = useCart(); 

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!selectedAppetizer) {
      alert('Please select an appetizer before proceeding.');
      return;
    }
    addToCart('appetizer', selectedAppetizer);
    goToNextStep();
  }

  return (
    <form className='form-container' onSubmit={handleSubmit}>
      <h2 >Choose an appetizer</h2>
      <ul className='food-list appetizer-list'>
        {appetizerData.map((item) => (
          <li key={item.name} 
              className={`menuItem ${selectedAppetizer === item ? 'selected' : ''}`} 
              onClick={() => setSelectedAppetizer(item)}>
            <img src={item.photoName} alt={item.name} />
            <div>
              <h3>{item.name}</h3>
              <p>{item.ingredients}</p>
              <span>{item.soldOut ? 'Sold Out' : '$' + item.price}</span>
            </div>
          </li>
        ))}
      </ul>
      <button className='btn' type='button' onClick={goToPreviousStep}>Previous</button>
      <button className='btn' type='submit'>Next</button>
    </form>
  );
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function MainDishMenu({ goToNextStep, goToPreviousStep }) {
  const [selectedMainDish, setSelectedMainDish] = useState(null);
  const { addToCart } = useCart();

  const combinedData = [...mainDishData, ...pizzaData]; // Combine mainDishData and pizzaData arrays

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!selectedMainDish) {
      alert('Please select a Main Dish or a Pizza before proceeding.');
      return;
    }
    addToCart('mainDish', selectedMainDish);
    goToNextStep();
  }

  return (
    <form className='form-container' onSubmit={handleSubmit}>
      <h2>Choose a Main Dish or a Pizza</h2>
      <ul className='food-list main-dish-list'>
        {combinedData.map((item) => ( // Map over combined data
          <li key={item.name} 
              className={`menuItem ${selectedMainDish === item ? 'selected' : ''}`} 
              onClick={() => setSelectedMainDish(item)}>
            <img src={item.photoName} alt={item.name} />
            <div>
              <h3>{item.name}</h3>
              <p>{item.ingredients}</p>
              <span>{item.soldOut ? 'Sold Out' : '$' + item.price}</span>
            </div>
          </li>
        ))}
      </ul>
      <button className='btn' type='button' onClick={goToPreviousStep}>Previous</button>
      <button className='btn' type='submit'>Next</button>
    </form>
  );
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function DessertMenu({ goToNextStep, goToPreviousStep }) {
  const [selectedDessert, setSelectedDessert] = useState(null);
  const { addToCart } = useCart();

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!selectedDessert) {
      alert('Please select a Dessert before proceeding.');
      return;
    }
    addToCart('dessert', selectedDessert);
    goToNextStep();
  }

  return (
    <form className='form-container' onSubmit={handleSubmit}>
      <h2 >Choose a Dessert</h2>
      <ul className='food-list appetizer-list'>
        {dessertData.map((item) => (
          <li key={item.name} 
              className={`menuItem ${selectedDessert === item ? 'selected' : ''}`} 
              onClick={() => setSelectedDessert(item)}>
            <img src={item.photoName} alt={item.name} />
            <div>
              <h3>{item.name}</h3>
              <p>{item.ingredients}</p>
              <span>{item.soldOut ? 'Sold Out' : '$' + item.price}</span>
            </div>
          </li>
        ))}
      </ul>
      <button className='btn' type='button' onClick={goToPreviousStep}>Previous</button>
      <button className='btn' type='submit'>Next</button>
    </form>
  );
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function OrderConfirmation({ goToPreviousStep }) {
  const { cart } = useCart(); 

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!cart.userInfo || !cart.appetizer || !cart.mainDish || !cart.dessert) {
      alert('Your order is incomplete. Please ensure you have selected all items and entered your information.');
      return;
    }
    alert('Your order has been placed!');
  }

  const DELIVERY_FEE = 5.00; // Set your delivery fee

  // Calculate total price
  const totalPrice = cart.appetizer?.price + cart.mainDish?.price + cart.dessert?.price + DELIVERY_FEE;

  return (
    <form className='confirmForm' onSubmit={handleSubmit}>
      <h2>Order Confirmation</h2>

      <h3>Personal Information:</h3>
      <p>Name: {cart.userInfo?.name}</p> 
      <p>Address: {cart.userInfo?.address}</p> 
      <p>Phone Number: {cart.userInfo?.phone}</p>

      <h3>Your Order:</h3>
      <ul className='food-list confirmation-list'>
        {['appetizer', 'mainDish', 'dessert'].map(category => (
          cart[category] && (
            <li key={cart[category].name} className='menuItem'>
              <img src={cart[category].photoName} alt={cart[category].name} />
              <div>
                <h3>{cart[category].name}</h3>
                <span>{cart[category].soldOut ? 'Sold Out' : '$' + cart[category].price.toFixed(2)}</span>
              </div>
            </li>
          )
        ))}
      </ul>
      <p>Delivery Fee: ${DELIVERY_FEE.toFixed(2)}</p>
      <h3>Total Price: ${totalPrice.toFixed(2)}</h3>

      <button className='btn' type='button' onClick={goToPreviousStep}>Previous</button>
      <button className='btn' type='submit'>Submit</button>
    </form>
  );
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  
const root = ReactDOM.createRoot(document.getElementById("root")); // grab the root element from the DOM
root.render(<React.StrictMode>
    <App />
</React.StrictMode>); // render the App component to the DOM