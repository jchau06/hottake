import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import {
  TitleBlock,
  ItemBlock,
  Spacer,
} from "../../components/StaticComponent";

export default function About() {
  return (
    <>
      <Navbar />
      <div style={{ height: "60px" }}></div>

      <TitleBlock
        title="About HotTake"
        url="https://www.arts.uci.edu/sites/default/files/Visit-StudentCenter.jpg"
      />
      <ItemBlock title="Our Purpose">
        HotTake was created as a platform where users can create and rate other
        people's hot takes within their college, connecting the community and
        providing comedic relief. We aim to provide a space where unheard
        opinions can be shared and your anonymity is respected.
      </ItemBlock>
      {/* <ItemBlock title="Our Founders">
        HotTake was founded in December of 2022 by two students studying
        Computer Science with a passion for Web Development. They are currently
        studying at University of California, Irvine and University of Illinois
        Urbana-Champaign.
      </ItemBlock> */}
      <Spacer size={100} />

      <Footer />
    </>
  );
}
