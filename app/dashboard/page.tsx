import Airdrop from "@/components/airdrop";
import { Header } from "@/components/header";
import TokenManager from "@/components/mintToken";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Dashboard() {
  return (
    <div>
      <Header />
      <div className="mt-24 md:mt-28 container mx-auto px-4 md:px-6 max-w-4xl">
        <Tabs defaultValue="airdrop">
          <TabsList>
            <TabsTrigger value="airdrop">
              <p className="font-semibold p-2">Air Drop</p>
            </TabsTrigger>
            <TabsTrigger value="mintToken">
              <p className="font-semibold p-2">Mint Token</p>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="airdrop" className="mt-3">
            <Airdrop />
          </TabsContent>
          <TabsContent value="mintToken" className="mt-3">
            <TokenManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
