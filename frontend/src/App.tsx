import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface OrderEvent {
    timestamp: string;
    product_name: string;
    category: string;
    quantity: number;
    revenue: number;
}

export default function App() {
    const [liveOrders, setLiveOrders] = useState<OrderEvent[]>([]);
    const [totalRevenue, setTotalRevenue] = useState<number>(0);
    const [categoryCounts, setCategoryCounts] = useState<{ [key: string]: number }>({});

    useEffect(() => {
        // Establish connection to backend WebSocket
        const ws = new WebSocket('wss://ecommerce-backend-gv5o.onrender.com');

        ws.onmessage = (event) => {
            const newOrder: OrderEvent = JSON.parse(event.data);

            // 1. Maintain a rolling log of the last 5 live transactions
            setLiveOrders((prev) => [newOrder, ...prev.slice(0, 4)]);

            // 2. Accumulate overall live platform revenue
            setTotalRevenue((prev) => parseFloat((prev + newOrder.revenue).toFixed(2)));

            // 3. Update category aggregation data for the charts
            setCategoryCounts((prev) => {
                const updated = { ...prev };
                updated[newOrder.category] = (updated[newOrder.category] || 0) + newOrder.quantity;
                return updated;
            });
        };

        return () => ws.close(); // Clean up connection on component unmount
    }, []);

    // Format category dictionary into an array structure that Recharts expects
    const chartData = Object.keys(categoryCounts).map((cat) => ({
        name: cat,
        Quantity: categoryCounts[cat],
    }));

    return (
        <div style={{ padding: '24px', fontFamily: 'sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
            <header style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827' }}>⚡ Real-Time E-Commerce Insights Engine</h1>
                <p style={{ color: '#6b7280' }}>Simulated pipeline tracking live orders via WebSockets</p>
            </header>

            {/* Metric Cards Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
                <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <h2 style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Total Live Platform Revenue</h2>
                    <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#10B981', margin: '8px 0 0 0' }}>${totalRevenue.toLocaleString()}</p>
                </div>
                <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <h2 style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Items Sold Across Categories</h2>
                    <div style={{ width: '100%', height: '140px', marginTop: '10px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} />
                                <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                                <Tooltip />
                                <Bar dataKey="Quantity" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Live Activity Stream */}
            <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', marginBottom: '16px' }}>🕒 Live Order Ticker</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {liveOrders.length === 0 ? (
                        <p style={{ color: '#9ca3af', fontStyle: 'italic' }}>Awaiting initial streaming payload...</p>
                    ) : (
                        liveOrders.map((order, idx) => (
                            <div key={idx} style={{ padding: '12px', borderLeft: '4px solid #3B82F6', background: '#F3F4F6', borderRadius: '0 4px 4px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <strong style={{ color: '#1F2937' }}>{order.product_name}</strong>
                                    <span style={{ fontSize: '12px', background: '#E5E7EB', padding: '2px 6px', borderRadius: '10px', marginLeft: '8px', color: '#4B5563' }}>{order.category}</span>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{ fontWeight: 'bold', color: '#10B981' }}>+${order.revenue}</span>
                                    <div style={{ fontSize: '11px', color: '#9CA3AF' }}>Qty: {order.quantity} • {order.timestamp}</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}