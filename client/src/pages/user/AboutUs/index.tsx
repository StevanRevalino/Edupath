import ProfilePageLayout from "../../../components/ProfilePageLayout";

export default function AboutUs() {
  return (
    <ProfilePageLayout>
      <div className="p-10">
        {/* Header */}
        <h1 className="text-4xl font-bold text-gray-800 mb-8">
          Tentang kami
        </h1>

        {/* Content Paragraphs */}
        <div className="space-y-5 text-gray-700 leading-relaxed">
          <p className="text-justify">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean
            et felis rhoncus, rutrum orci in, ornare ex. Donec non lacus ac
            lacus interdum sollicitudin a in mi. In sit amet odio libero.
            Orci varius natoque penatibus et magnis dis parturient montes,
            nascetur ridiculus mus. Maecenas et dictum dolor, quis tempor
            nulla. Proin eget magna justo. Vestibulum ac urna a nulla
            euismod sodales eget in mauris. Nullam non nisl a orci
            scelerisque rutrum.
          </p>

          <p className="text-justify">
            Sed ut tincidunt diam. Etiam nunc sem, eleifend accumsan nibh a,
            porttitor euismod velit. Quisque luctus luctus velit sed
            scelerisque. Etiam interdum accumsan tellus. Maecenas auctor
            egestas metus, id lacinia risus elementum vitae. Pellentesque
            cursus pellentesque iaculis. Fusce et sem at dolor condimentum
            egestas. Proin rhoncus ultrices nisl eget pulvinar. Sed
            vulputate mi in sem ultrices vehicula. Nulla quis ultrices
            dolor. Phasellus sodales lobortis purus, vitae mollis urna
            sollicitudin ut. Nulla pretium aliquet est, nec elementum odio
            aliquam ut. Integer magna lorem, dictum non vehicula ut, aliquam
            quis tellus.
          </p>
        </div>
      </div>
    </ProfilePageLayout>
  );
}
