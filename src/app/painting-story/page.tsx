import Link from 'next/link';

export default function PaintingStory() {
  return (
    <div className="bg-white py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <Link href="/" className="text-green-600 hover:underline font-semibold">
            &larr; Back to headacheMD.org
          </Link>
        </div>

        <article className="prose lg:prose-xl mx-auto">
          <h2>The Creation of "Complex and Fragile"</h2>
          <p>A collaboration between artist Isabelle Dupuy and neurologist Dr. Pamela Blake.</p>

          <h2>Early Sketch</h2>
          <img src="/images/paintings/FB_IMG_1752156122504.jpg" alt="Early brain sketch" className="rounded-lg shadow-lg"/>
          <p className="text-sm text-gray-600 italic text-center">Initial outline sketched by Isabelle Dupuy.</p>

          <img src="/images/paintings/FB_IMG_1752156131321.jpg" alt="Very early stages of the artwork" className="rounded-lg shadow-lg"/>
          <p className="text-sm text-gray-600 italic text-center">Very early stages of the 3D acrylic painting development.</p>

          <h2>Initial Stages</h2>
          <img src="/images/paintings/FB_IMG_1752156134621.jpg" alt="Initial stages of the artwork" className="rounded-lg shadow-lg"/>
          <p className="text-sm text-gray-600 italic text-center">Initial stages of the 3D acrylic painting development.</p>

          <h2>Early Stages</h2>
          <img src="/images/paintings/FB_IMG_1752156138199.jpg" alt="Early stages of the artwork" className="rounded-lg shadow-lg"/>
          <p className="text-sm text-gray-600 italic text-center">Early stages of the artwork development.</p>

          <h2>Artwork in Progress</h2>
          <img src="/images/paintings/4144385766608828795.jpg" alt="Artwork in progress" className="rounded-lg shadow-lg"/>
          <p className="text-sm text-gray-600 italic text-center">Further development of the 3D acrylic painting.</p>

          <h3>Dr. Blake explains how she uses the painting "Complex and Fragile" with patients</h3>
          <img src="/images/paintings/FB_IMG_1752156112020.jpg" alt="Dr. Blake explains the painting to patients" className="rounded-lg shadow-lg"/>
          <p className="text-sm text-gray-600 italic text-center">Dr. Blake uses "Complex and Fragile" as a simplified visual aid to help put patients at ease and build rapport for the diagnosis and treatment of headaches and neck pain due to nerve compression.</p>

          <p className="text-sm text-gray-600 italic">Dedication of artwork. Dr. Blake was very patient with me on this illustrative work, which was the first of its kind in my style. As you know, my focus is typically landscapes and impressionistic artworks. Dr. Blake kept it simple and helped me bridge some basic understanding of the brain from my undergraduate work in Psychology.</p>

          <h2>Inside headacheMD, Houston</h2>
          <img src="/images/paintings/FB_IMG_1752156096191.jpg" alt="Inside the Headache center of River Oaks with Dr. Pamela Blake" className="rounded-lg shadow-lg"/>
          <img src="/images/paintings/FB_IMG_1752156105005.jpg" alt="Artwork in the courtyard of Dr. Blake's practice" className="rounded-lg shadow-lg"/>
          <p className="text-sm text-gray-600 italic text-center">Artwork in the courtyard of Dr. Blake's practice. Dr. Blake can use this work as a basic, simplified visual at first with patients rather than starting with complex and intimidating illustrative posters. It can aid in putting patients at ease and building rapport for the diagnosis and treatment of headaches and neck pain due to nerve compression.</p>

          <h2>Celebration</h2>
          <img src="/images/paintings/FB_IMG_1752156115536.jpg" alt="Celebration of the completed project" className="rounded-lg shadow-lg"/>
          <p className="text-sm text-gray-600 italic text-center">A casual celebration next door for the completion of this project. My husband Bradley and I have a deep respect for Dr. Blake's groundbreaking work, contribution in her field, and the life changing help she provides for her patients.</p>


          <p>Learn more about Dr. Blake's work at <a href="https://www.headacheMD.org" className="text-green-600 hover:underline">headacheMD.org</a> and <a href="https://headache.zone" className="text-green-600 hover:underline">headache.zone</a>.</p>
        </article>
      </div>
    </div>
  );
}
