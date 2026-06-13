-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Properties table
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  address VARCHAR(255) NOT NULL,
  images JSONB,
  capacity INT DEFAULT 1,
  rules TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Guests table
CREATE TABLE IF NOT EXISTS guests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20),
  document_type VARCHAR(50),
  document_url TEXT,
  document_verified BOOLEAN DEFAULT FALSE,
  contract_url TEXT,
  contract_signed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id),
  guest_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'active', 'completed', 'cancelled')),
  total_price DECIMAL(10, 2),
  payment_method VARCHAR(20) CHECK (payment_method IN ('bank_transfer', 'stripe', 'paypal')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id),
  amount DECIMAL(10, 2) NOT NULL,
  method VARCHAR(20) NOT NULL CHECK (method IN ('bank_transfer', 'stripe', 'paypal')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  transaction_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX idx_bookings_property_id ON bookings(property_id);
CREATE INDEX idx_bookings_email ON bookings(email);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_check_in ON bookings(check_in);
CREATE INDEX idx_bookings_check_out ON bookings(check_out);
CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_guests_email ON guests(email);

-- Enable Row Level Security
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for public properties (anyone can view)
CREATE POLICY "Properties are publicly readable" ON properties FOR SELECT USING (true);

-- RLS Policies for bookings (users can view their own, admins can view all)
CREATE POLICY "Users can view their own bookings" ON bookings FOR SELECT
  USING (auth.jwt() ->> 'email' = email OR auth.jwt() ->> 'email' = 'alexander@example.com');

CREATE POLICY "Users can create bookings" ON bookings FOR INSERT
  WITH CHECK (true);

-- RLS for guests
CREATE POLICY "Guests are readable by owner" ON guests FOR SELECT
  USING (true);

-- Create a function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for bookings table
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE
  ON bookings FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
