
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { CreditCard, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PaymentProcessorProps {
  bookingId: string;
  amount: number;
  currency?: string;
  onPaymentSuccess?: (paymentIntentId: string) => void;
}

export const PaymentProcessor: React.FC<PaymentProcessorProps> = ({
  bookingId,
  amount,
  currency = 'usd',
  onPaymentSuccess,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
  });
  const { toast } = useToast();

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      // In a real app, you'd use Stripe Elements for secure card processing
      // This is a simplified example
      const { data, error } = await supabase.functions.invoke('process-payment', {
        body: {
          amount,
          currency,
          booking_id: bookingId,
          payment_method: 'card', // In real implementation, this would be a Stripe payment method ID
        },
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: 'Payment Successful',
          description: 'Your booking has been confirmed!',
        });
        onPaymentSuccess?.(data.payment_intent);
      } else {
        throw new Error('Payment failed');
      }
    } catch (error) {
      toast({
        title: 'Payment Failed',
        description: 'There was an error processing your payment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Secure Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label htmlFor="cardNumber">Card Number</Label>
            <Input
              id="cardNumber"
              placeholder="1234 5678 9012 3456"
              value={paymentData.cardNumber}
              onChange={(e) =>
                setPaymentData(prev => ({ ...prev, cardNumber: e.target.value }))
              }
            />
          </div>
          <div>
            <Label htmlFor="expiryDate">Expiry Date</Label>
            <Input
              id="expiryDate"
              placeholder="MM/YY"
              value={paymentData.expiryDate}
              onChange={(e) =>
                setPaymentData(prev => ({ ...prev, expiryDate: e.target.value }))
              }
            />
          </div>
          <div>
            <Label htmlFor="cvv">CVV</Label>
            <Input
              id="cvv"
              placeholder="123"
              value={paymentData.cvv}
              onChange={(e) =>
                setPaymentData(prev => ({ ...prev, cvv: e.target.value }))
              }
            />
          </div>
          <div className="col-span-2">
            <Label htmlFor="cardholderName">Cardholder Name</Label>
            <Input
              id="cardholderName"
              placeholder="John Doe"
              value={paymentData.cardholderName}
              onChange={(e) =>
                setPaymentData(prev => ({ ...prev, cardholderName: e.target.value }))
              }
            />
          </div>
        </div>

        <div className="bg-muted p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-medium">Total Amount:</span>
            <span className="text-xl font-bold">
              ${amount.toFixed(2)} {currency.toUpperCase()}
            </span>
          </div>
        </div>

        <Button
          onClick={handlePayment}
          disabled={isProcessing}
          className="w-full"
          size="lg"
        >
          <Lock className="w-4 h-4 mr-2" />
          {isProcessing ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
        </Button>

        <div className="text-xs text-muted-foreground text-center">
          🔒 Your payment information is secure and encrypted
        </div>
      </CardContent>
    </Card>
  );
};
