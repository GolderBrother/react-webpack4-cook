import React from 'react';
import { Route, Link, Switch } from 'react-router-dom';
import Home from "../pages/Home";
import Count from "../pages/Count";
import "../assets/home.scss";


const PrimaryLayout = () => (
    <section className="primary-layout">
        <header className="layout-head">
            <p><Link to="/">Home</Link></p>
            <p><Link to="/count">Count</Link></p>
        </header>
        <main className="layout-body">
            <Switch>
                <Route path="/" exact component={Home} />
                <Route path="/count" exact component={Count} />
            </Switch>
        </main>
    </section>
);

export default PrimaryLayout;